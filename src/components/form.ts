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

  /**
   * Fills all form inputs of the given entity.
   *
   * @param entity - An object of any depth with the field: value pairs of the form inputs.
   *
   * @example
   * ```
   * // fills "Name" text input, "Age" text or number input, "Can Drive" checkbox input.
   * await myForm.fillAll({ name: "Angie", canDrive: true });
   * ```
   * @example
   * ```
   * // fills "First Name" text input, "Last Name" text input, "Age" text or number input.
   * await myForm.fillAll({ "Name": { "First Name": "Jane", "Last Name": "Doh" }, "Age": 25 });
   * ```
   */
  async fillAll(entity: Entity) {
    for (const key of Object.keys(entity)) {
      await this.fillOne(key, entity[key]);
    }
  }

  /**
   * Fills one form input.
   *
   * @param field - The form field to fill in "camelCaseFormat" or "Phrase Format".
   * @param value - An object of any depth with value to fill in or a field: value pairs of the form inputs.
   *
   * @example
   * ```
   * // fills "Name" text input.
   * await myForm.fillOne("name", "Angie");
   * ```
   * @example
   * ```
   * // Doesn't fill anything.
   * await myForm.fillOne("age", undefined);
   * ```
   */
  async fillOne(field: string, value?: FillValue | Entity) {
    if (value === undefined) {
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
      const role = await this.getInput(field).getAttribute("role");

      if (role === "combobox") {
        await this.fillCombobox(field, value);
      } else {
        await this.fillText(field, value);
      }
    } else {
      const type = await this.getInput(field).getAttribute("type");

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
    const labelExp = this.getLabelRegExp(field);

    const combobox = this.root.getByRole("combobox", {
      name: labelExp,
    });
    await combobox.click();

    const optionsList = this.page.getByLabel(labelExp).last();
    const role = await optionsList.getAttribute("role");

    await optionsList
      .getByRole(this.optionRoleFor(role), { name: value })
      .click();
  }

  async fillFile(field: string, value: string[]) {
    await this.getInput(field).setInputFiles(value);
  }

  async fillText(field: string, value: string | number) {
    await this.getInput(field).fill("" + value);
  }

  async getErrorMessage(field: string): Promise<string | undefined> {
    const errorId =
      await this.getInput(field).getAttribute("aria-errormessage");
    const error = this.root.locator(`#${errorId}`);

    if (!(await error.isVisible())) {
      return undefined;
    }

    return (await error.textContent()) || undefined;
  }

  private getInput(field: string) {
    return this.root
      .getByLabel(this.getLabelRegExp(field))
      .or(this.root.getByPlaceholder(this.getLabelRegExp(field)))
      .first();
  }

  private getLabelRegExp(field: string) {
    return new RegExp(
      `^${field.includes(" ") ? field : toPhrase(field)}\\s*\\*?$`,
      "i",
    );
  }

  private optionRoleFor(role: string) {
    if (role === "tree") return "treeitem";
    return "option";
  }
}
