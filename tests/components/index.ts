import { test as base } from "@playwright/test";
import { DialogPage } from "./dialog";
import { FormPage } from "./form";
import { TablePage } from "./table";
import { GridPage } from "./grid";

type Pages = {
  dialogPage: DialogPage;
  formPage: FormPage;
  tablePage: TablePage;
  gridPage: GridPage;
};

export const test = base.extend<Pages>({
  dialogPage: async ({ page }, use) => use(new DialogPage(page)),
  formPage: async ({ page }, use) => use(new FormPage(page)),
  tablePage: async ({ page }, use) => use(new TablePage(page)),
  gridPage: async ({ page }, use) => use(new GridPage(page)),
});

export { expect } from "@playwright/test";
