import { test as base } from "@playwright/test";
import { fixtures, Fixtures } from "../../src";

export const test = base.extend<Fixtures>({
  ...fixtures,
});

export * from "@playwright/test";
