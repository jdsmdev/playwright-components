import { APIResponse } from "playwright";
import { connect } from "http2";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Serializable = any;
type Http2Method =
  | "GET"
  | "POST"
  | "PUT"
  | "DELETE"
  | "PATCH"
  | "HEAD"
  | "OPTIONS"
  | "CONNECT"
  | "TRACE";
type Http2Data = string | Buffer | Serializable;
type Http2Headers = { [key: string]: string };
type Http2Params = { [key: string]: string | number | boolean };

type Http2ClientOptions = {
  /**
   * Allows to set post data of the request. If the data parameter is an object, it will be serialized to json string
   * and `content-type` header will be set to `application/json` if not explicitly set. Otherwise the `content-type`
   * header will be set to `application/octet-stream` if not explicitly set.
   */
  data?: Http2Data;

  /**
   * Whether to throw on response codes other than 2xx and 3xx. By default response object is returned for all status
   * codes.
   */
  failOnStatusCode?: boolean;

  /**
   * Allows to set HTTP headers. These headers will apply to the fetched request as well as any redirects initiated by
   * it.
   */
  headers?: Http2Headers;

  /**
   * Whether to ignore HTTPS errors when sending network requests. Defaults to `false`.
   */
  ignoreHTTPSErrors?: boolean;

  /**
   * Query parameters to be sent with the URL.
   */
  params?: Http2Params;

  /**
   * Request timeout in milliseconds. Defaults to `30000` (30 seconds). Pass `0` to disable timeout.
   */
  timeout?: number;
};

const DEFAULT_TIMEOUT = 30000;

// Status Code → Status Text Mapping
export const STATUS_TEXTS: Record<number, string> = {
  100: "Continue",
  101: "Switching Protocols",
  102: "Processing",
  103: "Early Hints",

  200: "OK",
  201: "Created",
  202: "Accepted",
  203: "Non-Authoritative Information",
  204: "No Content",
  205: "Reset Content",
  206: "Partial Content",
  207: "Multi-Status",
  208: "Already Reported",
  226: "IM Used",

  300: "Multiple Choices",
  301: "Moved Permanently",
  302: "Found",
  303: "See Other",
  304: "Not Modified",
  305: "Use Proxy",
  306: "Switch Proxy", // This is deprecated, but still exists.
  307: "Temporary Redirect",
  308: "Permanent Redirect",

  400: "Bad Request",
  401: "Unauthorized",
  402: "Payment Required",
  403: "Forbidden",
  404: "Not Found",
  405: "Method Not Allowed",
  406: "Not Acceptable",
  407: "Proxy Authentication Required",
  408: "Request Timeout",
  409: "Conflict",
  410: "Gone",
  411: "Length Required",
  412: "Precondition Failed",
  413: "Payload Too Large",
  414: "URI Too Long",
  415: "Unsupported Media Type",
  416: "Range Not Satisfiable",
  417: "Expectation Failed",
  418: "I'm a Teapot", // (RFC 2324 - April Fools' Joke)
  421: "Misdirected Request",
  422: "Unprocessable Entity",
  423: "Locked",
  424: "Failed Dependency",
  425: "Too Early",
  426: "Upgrade Required",
  428: "Precondition Required",
  429: "Too Many Requests",
  431: "Request Header Fields Too Large",
  451: "Unavailable For Legal Reasons",

  500: "Internal Server Error",
  501: "Not Implemented",
  502: "Bad Gateway",
  503: "Service Unavailable",
  504: "Gateway Timeout",
  505: "HTTP Version Not Supported",
  506: "Variant Also Negotiates",
  507: "Insufficient Storage",
  508: "Loop Detected",
  510: "Not Extended",
  511: "Network Authentication Required",
};

export class Http2Client {
  constructor(
    private readonly baseURL: string | undefined,
    private extraHTTPHeaders?:
      | {
          [key: string]: string;
        }
      | undefined,
    private ignoreHTTPSErrors?: boolean | undefined,
  ) {}

  async delete(
    url: string,
    options?: Http2ClientOptions,
  ): Promise<APIResponse> {
    return this.request("DELETE", url, options);
  }

  async get(url: string, options?: Http2ClientOptions): Promise<APIResponse> {
    return this.request("GET", url, options);
  }

  async patch(url: string, options?: Http2ClientOptions): Promise<APIResponse> {
    return this.request("PATCH", url, options);
  }

  async post(url: string, options?: Http2ClientOptions): Promise<APIResponse> {
    return this.request("POST", url, options);
  }

  async put(url: string, options?: Http2ClientOptions): Promise<APIResponse> {
    return this.request("PUT", url, options);
  }

  private request(
    method: Http2Method,
    url: string,
    options?: Http2ClientOptions,
  ): Promise<APIResponse> {
    const [base, path] = this.getRequestURL(url);
    const query = this.query(options?.params);
    const client = connect(base, {
      rejectUnauthorized: !this.ignoreHTTPSErrors,
    });

    return new Promise((resolve, reject) => {
      const req = client.request({
        ":method": method,
        ":path": `${path}${query}`,
        accept: "*/*",
        ...this.headers(options?.headers, options?.data),
      });

      const responseHeaders: Record<string, string> = {};
      const chunks: Buffer[] = [];

      const dispose = async () => {
        chunks.length = 0;
      };

      req.on("response", (headers) => {
        Object.entries(headers).forEach(
          ([key, value]) => (responseHeaders[key] = String(value)),
        );
      });

      req.on("data", (chunk) => {
        chunks.push(Buffer.from(chunk));
      });

      const timeout = options?.timeout || DEFAULT_TIMEOUT;

      req.setTimeout(timeout, () => {
        req.close();
        reject(
          new Error(`Request to ${base}${path} timed out after ${timeout}ms`),
        );
      });

      req.on("end", () => {
        const status = responseHeaders[":status"]
          ? parseInt(responseHeaders[":status"], 10)
          : 500;

        const statusText = () => STATUS_TEXTS[status] || "Unknown Status";

        const ok = () => status > 199 && status < 400;

        delete responseHeaders[":status"];

        client.close();

        if (options?.failOnStatusCode && !ok()) {
          let responseText = "";
          if (chunks.length > 0) {
            let text = Buffer.concat(chunks).toString("utf8");
            if (text.length > 1000) text = text.substring(0, 997) + "...";
            responseText = `\nResponse text:\n${text}`;
          }
          dispose();
          reject(new Error(`${status} ${statusText()}${responseText}`));
        }

        resolve({
          status: () => status,
          statusText,
          headers: () => responseHeaders,
          headersArray: () =>
            Object.entries(responseHeaders).map(([name, value]) => ({
              name,
              value,
            })),
          json: async <T>() =>
            JSON.parse(Buffer.concat(chunks).toString()) as T,
          text: async () => Buffer.concat(chunks).toString("utf8"),
          body: async () => Buffer.concat(chunks),
          url: () => `${base}${path}${query}`,
          ok,
          dispose,
          [Symbol.asyncDispose]: dispose,
        });
      });

      req.on("error", (error) => {
        reject(error);
      });

      // if a body is provided, write it to the request.
      if (options?.data) {
        req.write(this.data(options.data));
      }

      req.end();
    });
  }

  private data(data: Http2Data): Http2Data {
    if (typeof data === "object") {
      return JSON.stringify(data);
    }

    return data;
  }

  private getRequestURL(requestUrl: string): [string, string] {
    if (this.baseURL) {
      return [this.baseURL, requestUrl];
    }

    const url = new URL(requestUrl);
    const base = `${url.protocol}//${url.host}`;
    const path = url.pathname + url.search + url.hash;

    return [base, path];
  }

  private headers(
    headers?: Http2Headers,
    data?: Http2Data,
  ): Http2Headers | undefined {
    const generatedHeaders = { ...this.extraHTTPHeaders, ...headers };

    if (data && !headers?.["content-type"]) {
      if (typeof data === "object") {
        generatedHeaders["content-type"] = "application/json";
      } else {
        generatedHeaders["content-type"] = "application/octet-stream";
      }
    }

    return generatedHeaders;
  }

  private query(params?: Http2Params): string {
    if (!params) {
      return "";
    }

    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) =>
      query.append(key, String(value)),
    );

    return `?${query.toString()}`;
  }
}
