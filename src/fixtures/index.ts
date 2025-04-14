import { Http2Client } from "./http2";

export * from "./http2";

export type Fixtures = { http2: Http2Client };

export const fixtures = {
  http2: async (
    {
      baseURL,
      extraHTTPHeaders,
      ignoreHTTPSErrors,
    }: {
      baseURL: string | undefined;
      extraHTTPHeaders: { [key: string]: string } | undefined;
      ignoreHTTPSErrors: boolean | undefined;
    },
    use: (r: Http2Client) => Promise<void>,
  ) => use(new Http2Client(baseURL, extraHTTPHeaders, ignoreHTTPSErrors)),
};
