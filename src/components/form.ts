import { Locator, Page } from "playwright";
import { toPhrase } from "../utils";

export type Entity = { [key: string]: FillValue | Entity };

export type FillValue = string | string[] | number | boolean | undefined;

/**
 * Page component that Represents a form.
 *
 * @example
 * ```
 * export class MyPage {
 *  readonly myForm: FormComponent;
 *
 *  constructor(page: Page) {
 *    this.myForm = new FormComponent(page.locator("form"));
 *  }
 * }
 *
 * const myPage = new MyPage(page);
 * await myPage.myForm.fillAll({ name: "Angie", gender: "Female" });
 * ```
 */
export class FormComponent {
  readonly page: Page;
  readonly root: Page | Locator;
  readonly submitButton: Locator;
  readonly cancelButton: Locator;
  readonly cancelLink: Locator;

  constructor(root: Page | Locator) {
    this.page = "page" in root ? root.page() : root;
    this.root = root;
    this.submitButton = root.locator("button[type='submit']");
    this.cancelButton = root.getByRole("button", { name: "cancel" });
    this.cancelLink = root.getByRole("link", { name: "cancel" });
  }

  async fillAll(entity: Entity) {
    for (const key of Object.keys(entity)) {
      await this.fillOne(key, entity[key]);
    }
  }

  async fillOne(field: string, value?: FillValue | Entity) {
    if (!value) {
      return;
    }

    await (typeof value === "object" && !Array.isArray(value)
      ? this.fillAll(value)
      : this.fillAny(field, value));
  }

  async fillAny(field: string, value: Exclude<FillValue, undefined>) {
    if (typeof value === "boolean") {
      await this.fillCheckbox(field, value);
    } else if (typeof value === "number") {
      await this.fillText(field, value);
    } else if (typeof value === "string") {
      const role = await this.getInputByLabel(field).getAttribute("role");

      if (role === "combobox") {
        await this.fillCombobox(field, value);
      } else {
        await this.fillText(field, value);
      }
    } else {
      const type = await this.getInputByLabel(field).getAttribute("type");

      if (type === "file") {
        await this.fillFile(field, value);
      }
    }
  }

  async fillCheckbox(field: string, value: boolean) {
    await this.root
      .getByRole("checkbox", { name: this.getLabelRegExp(field) })
      .setChecked(value);
  }

  async fillCombobox(field: string, value: string) {
    const combobox = this.root.getByRole("combobox", {
      name: this.getLabelRegExp(field),
    });
    await combobox.click();
    await this.page.getByRole("option", { name: value }).click();
  }

  async fillFile(field: string, value: string[]) {
    await this.getInputByLabel(field).setInputFiles(value);
  }

  async fillText(field: string, value: string | number) {
    await this.getInputByLabel(field).fill("" + value);
  }

  async getErrorMessage(field: string): Promise<string | undefined> {
    const errorId =
      await this.getInputByLabel(field).getAttribute("aria-errormessage");
    const error = this.root.locator(`#${errorId}`);

    if (!(await error.isVisible())) {
      return undefined;
    }

    return (await error.textContent()) || undefined;
  }

  private getInputByLabel(field: string) {
    return this.root.getByLabel(this.getLabelRegExp(field)).first();
  }

  private getLabelRegExp(field: string) {
    return new RegExp(
      `^${field.includes(" ") ? field : toPhrase(field)}\\s*\\*?$`,
      "i",
    );
  }
}
