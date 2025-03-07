import { test, expect } from "..";

test.beforeEach(async ({ page }) => {
  await page.goto("tests/components/form/form.html");
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

test("should be able to fill text input on form", async ({ formPage }) => {
  // WHEN
  await formPage.form.fillOne("name", "angie");

  // THEN
  await expect(formPage.form.root.getByLabel("name")).toHaveValue("angie");
});

test("should be able to fill number input on form", async ({ formPage }) => {
  // WHEN
  await formPage.form.fillOne("age", 30);

  // THEN
  await expect(formPage.form.root.getByLabel("age")).toHaveValue("30");
});

test("should be able to fill checkbox input on form", async ({ formPage }) => {
  // WHEN
  await formPage.form.fillOne("iCanDrive", true);

  // THEN
  await expect(formPage.form.root.getByLabel("I Can Drive")).toBeChecked();
});

test("should be able to fill checkbox input with phrase on form", async ({
  formPage,
}) => {
  // WHEN
  await formPage.form.fillOne("I Can Drive", true);

  // THEN
  await expect(formPage.form.root.getByLabel("I Can Drive")).toBeChecked();
});

test("should be able to fill all inputs on form", async ({ formPage }) => {
  // WHEN
  await formPage.form.fillAll({
    name: "regie",
    lastName: "santini",
    age: "25",
    iCanDrive: false,
  });

  // THEN
  await expect(formPage.form.root.getByLabel("name")).toHaveValue("regie");
  await expect(formPage.form.root.getByPlaceholder("last name")).toHaveValue(
    "santini",
  );
  await expect(formPage.form.root.getByLabel("age")).toHaveValue("25");
  await expect(formPage.form.root.getByLabel("i can drive")).not.toBeChecked();
});

test("should be able to fill all inputs with depth on form", async ({
  formPage,
}) => {
  // WHEN
  await formPage.form.fillAll({
    profile: { name: "regie", age: "25" },
    options: { iCanDrive: false },
  });

  // THEN
  await expect(formPage.form.root.getByLabel("name")).toHaveValue("regie");
  await expect(formPage.form.root.getByLabel("age")).toHaveValue("25");
  await expect(formPage.form.root.getByLabel("I Can Drive")).not.toBeChecked();
});

test("should be able to get error message on form", async ({ formPage }) => {
  // WHEN
  const error = await formPage.form.getErrorMessage("name");

  // THEN
  expect(error).toBe("Name is empty!");
});

test("should be able to not get error message when invisible on form", async ({
  formPage,
}) => {
  // WHEN
  const error = await formPage.form.getErrorMessage("age");

  // THEN
  expect(error).toBeUndefined();
});
