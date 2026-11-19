import { test, expect } from "..";

test.beforeEach(async ({ page }) => {
  await page.goto("tests/components/grid/grid.html");
});

test("should get a column header", async ({ gridPage }) => {
  await expect(gridPage.grid.getColumnHeader("Header 1")).toBeVisible();
});

test("should get all column headers", async ({ gridPage }) => {
  const headers = await gridPage.grid.getColumnHeaders();

  expect(await headers.allTextContents()).toEqual([
    "Header 1",
    "Header 2",
    "Header 3",
  ]);
});

test("should get a body row", async ({ gridPage }) => {
  await expect(gridPage.grid.getBodyRow("Row 2, Cell 1")).toBeVisible();
});

test("should get body cell texts", async ({ gridPage }) => {
  const cells = await gridPage.grid.getBodyCellTexts();

  expect(cells).toHaveLength(3);
  expect(cells[0]).toHaveLength(3);
  expect(cells[1][1]).toBe("Row 2, Cell 2");
});

test("should get body rows as maps", async ({ gridPage }) => {
  const rows = await gridPage.grid.getBodyRowsAsMaps();

  expect(rows).toHaveLength(3);
  expect(rows[2].get("header3")).toBe("Row 3, Cell 3");
});

test("should get body rows as typed objects", async ({ gridPage }) => {
  const rows = await gridPage.grid.getBodyRowsAs<{
    header1: string;
    header2: string;
    header3: string;
  }>();

  expect(rows).toHaveLength(3);
  expect(rows[1].header2).toBe("Row 2, Cell 2");
});

test("should configure and read pagination", async ({ gridPage }) => {
  expect(await gridPage.grid.howManyRows()).toBe(10);
  await gridPage.grid.showRows(25);
  expect(await gridPage.grid.howManyRows()).toBe(25);
  expect(await gridPage.grid.getCurrentPage()).toBe(1);

  await expect(gridPage.grid.getFirstPage()).toBeVisible();
  await expect(gridPage.grid.getPrevPage()).toBeVisible();
  await expect(gridPage.grid.getNextPage()).toBeVisible();
  await expect(gridPage.grid.getLastPage()).toBeVisible();
});
