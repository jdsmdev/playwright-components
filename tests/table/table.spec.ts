import { test, expect } from "..";

test.beforeEach(async ({ page }) => {
  await page.goto("tests/table/table.html");
});

test("should be able to get coloumn header on table", async ({ tablePage }) => {
  // WHEN
  const header = tablePage.table.getColumnHeader("Header 1");

  // THEN
  await expect(header).toBeVisible();
});

test("should be able to get body row on table", async ({ tablePage }) => {
  // WHEN
  const row = tablePage.table.getBodyRow("Row 1");

  // THEN
  await expect(row).toBeVisible();
  await expect(row).toContainText("Row 1, Cell 1");
});

test("should be able to get body cell texts on table", async ({
  tablePage,
}) => {
  // WHEN
  const cells = await tablePage.table.getBodyCellTexts();

  // THEN
  expect(cells).toHaveLength(3);
  expect(cells[0]).toHaveLength(3);
  expect(cells[1][1]).toBe("Row 2, Cell 2");
});

test("should be able to get body rows as maps on table", async ({
  tablePage,
}) => {
  // WHEN
  const rows = await tablePage.table.getBodyRowsAsMaps();

  // THEN
  expect(rows).toHaveLength(3);
  expect(rows[2].get("header3")).toBe("Row 3, Cell 3");
});

test("should be able to get body rows as any record on table", async ({
  tablePage,
}) => {
  // WHEN
  const rows: { header1: string; header2: string; header3: string }[] =
    await tablePage.table.getBodyRowsAs();

  // THEN
  expect(rows).toHaveLength(3);
  expect(rows[1].header2).toBe("Row 2, Cell 2");
});
