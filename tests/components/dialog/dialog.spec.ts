import { test, expect } from "..";

test.beforeEach(async ({ page }) => {
  await page.goto("tests/components/dialog/dialog.html");
});

test("should be able to close on dialog", async ({ dialogPage }) => {
  // WHEN
  await dialogPage.dialog.closeButton.click();

  // THEN
  await expect(dialogPage.dialog.headingTitle).toBeVisible();
});

test("should be able to do action on dialog", async ({ dialogPage }) => {
  // WHEN
  await dialogPage.dialog.actionButton.click();

  // THEN
  await expect(dialogPage.dialog.headingTitle).toBeVisible();
});

test("should be able to cancel on dialog", async ({ dialogPage }) => {
  // WHEN
  await dialogPage.dialog.cancelButton.click();

  // THEN
  await expect(dialogPage.dialog.headingTitle).toBeVisible();
});

test("should be able to do secondary action on dialog", async ({
  dialogPage,
}) => {
  // WHEN
  await dialogPage.dialog.click("secondary");

  // THEN
  await expect(dialogPage.dialog.headingTitle).toBeVisible();
});
