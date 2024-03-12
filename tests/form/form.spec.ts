import { test, expect } from "..";

test.beforeEach(async ({ page }) => {
  await page.goto("tests/form/form.html");
});

test("should be able to cancel on form", async ({ formPage }) => {
  // WHEN
  await formPage.form.cancelButton.click();

  // THEN
  await expect(formPage.form.cancelButton).toBeVisible();
});

test("should be able to cancel link on form", async ({ formPage }) => {
  // WHEN
  await formPage.form.cancelLink.click();

  // THEN
  await expect(formPage.form.cancelLink).toBeVisible();
});
