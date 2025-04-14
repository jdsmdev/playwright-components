import { APIResponse, expect, test } from "..";
import { STATUS_TEXTS } from "../../../src";

test("should be able to do http2 GET", async ({ http2 }) => {
  // WHEN
  const response = await http2.get("/");

  // THEN
  validateResponse(response, 200, true);
});

test("should be able to do http2 GET with query", async ({ http2 }) => {
  // WHEN
  const response = await http2.get("/", { params: { blazeit: true } });

  // THEN
  validateResponse(response, 200, false);
  expect(await response.json()).toEqual({ str: "it is", num: 420, bool: true });
});

test("should be able to do http2 POST", async ({ http2 }) => {
  // WHEN
  const response = await http2.post("/", {
    data: { str: "it is", num: 42, bool: true },
  });

  // THEN
  validateResponse(response, 201, false);
});

test("should be able to do http2 PUT", async ({ http2 }) => {
  // WHEN
  const response = await http2.put("/", {
    data: { str: "it is", num: 42, bool: true },
  });

  // THEN
  validateResponse(response, 200, false);
});

test("should be able to do http2 PATCH", async ({ http2 }) => {
  // WHEN
  const response = await http2.patch("/", {
    data: { str: "it is", num: 42, bool: true },
  });

  // THEN
  validateResponse(response, 202, false);
});

test("should be able to do http2 DELETE", async ({ http2 }) => {
  // WHEN
  const response = await http2.delete("/");

  // THEN
  validateResponse(response, 204, false);
});

test("should be able to do http2 GET not found", async ({ http2 }) => {
  // WHEN
  const response = await http2.get("/not-found");

  // THEN
  validateResponse(response, 404, false);
  expect(response.headers()["content-type"]).toBe("application/json");
  expect(await response.json()).toEqual({ message: expect.any(String) });
});

test("should be able to do http2 GET error", async ({ http2 }) => {
  // WHEN
  const response = await http2.get("/error");

  // THEN
  validateResponse(response, 500, false);
  expect(response.headers()["content-type"]).toBe("application/json");
  expect(await response.json()).toEqual({ message: expect.any(String) });
});

test("should fallback uknown status code text", async ({ http2 }) => {
  // WHEN
  const response = await http2.get("/uknown-status");

  // THEN
  validateResponse(response, 569, false);
});

test("should fail on http2 GET error if option is set", async ({ http2 }) => {
  try {
    // WHEN
    const response = await http2.get("/error", { failOnStatusCode: true });
    // fail if no error is thrown
    expect(false).toBe("Expected an error to be thrown");
  } catch (error) {
    // THEN
    expect(error.message).toEqual(expect.any(String));
  }
});

test("should shorten fail message on http2 GET error if option is set", async ({
  http2,
}) => {
  try {
    // WHEN
    const response = await http2.get("/error?big=true", {
      failOnStatusCode: true,
    });
    // fail if no error is thrown
    expect(false).toBe("Expected an error to be thrown");
  } catch (error) {
    // THEN
    expect(error.message).toMatch(/\.\.\.$/);
  }
});

test("should timeout when option is set", async ({ http2 }) => {
  try {
    // WHEN
    const response = await http2.get("/", { timeout: 1 });
    // fail if no error is thrown
    expect(false).toBe("Expected an error to be thrown");
  } catch (error) {
    // THEN
    expect(error.message).toEqual(expect.any(String));
  }
});

const validateResponse = async (
  response: APIResponse,
  status: number,
  body: boolean,
) => {
  expect(response.url()).toContain("https://localhost:3000/");
  expect(response.status()).toBe(status);
  expect(response.statusText()).toBe(STATUS_TEXTS[status] || "Unknown Status");
  expect(response.ok()).toBe(status > 199 && status < 400);
  expect(Object.values(response.headers()).length).toBeGreaterThan(0);
  expect(response.headersArray().length).toBeGreaterThan(0);

  if (!body) return;
  expect(response.headers()["content-type"]).toBe("application/json");
  expect(response.headersArray()).toContainEqual({
    name: "content-type",
    value: "application/json",
  });
  expect(await response.json()).toEqual({ str: "it is", num: 42, bool: true });
  expect(await response.text()).toEqual('{"str":"it is","num":42,"bool":true}');
  expect((await response.body()).length).toBeGreaterThan(0);

  await response.dispose();

  expect((await response.body()).length).toBe(0);
};
