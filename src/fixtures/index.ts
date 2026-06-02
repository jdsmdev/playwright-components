import { Http2Client } from "./http2";

export * from "./http2";

/**
 * Additional Playwright fixture types provided by this package.
 */
export type Fixtures = { http2: Http2Client };

/**
 * Additional Playwright fixtures that can be merged into `test.extend(...)`.
 */
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
