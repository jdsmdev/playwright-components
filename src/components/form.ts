import { Locator, Page } from "playwright";
import { toPhrase } from "../utils";

export type Entity = { [key: string]: FillValue | Entity };

export type FillValue = string | string[] | number | boolean | undefined;

/**
 * Page component that represents a form.
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

  /**
   * Creates a form component from a page or form root locator.
   *
   * @param root - The page or locator scoped to the form container.
   */
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
   * @returns A promise that resolves after all mapped fields are filled.
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
   * @returns A promise that resolves after the field is processed.
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
    if (!value) {
      return;
    }

    await (typeof value === "object" && !Array.isArray(value)
      ? this.fillAll(value)
      : this.fillAny(field, value));
  }

  /**
   * Fills one field based on runtime value type.
   *
   * @param field - The form field to fill in "camelCaseFormat" or "Phrase Format".
   * @param value - The value to fill.
   * @returns A promise that resolves after the type-specific filling strategy completes.
   */
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

  /**
   * Sets a checkbox by its field label.
   *
   * @param field - The form field to match.
   * @param value - Whether the checkbox should be checked.
   * @returns A promise that resolves after the checkbox state is set.
   */
  async fillCheckbox(field: string, value: boolean) {
    await this.root
      .getByRole("checkbox", { name: this.getLabelRegExp(field) })
      .setChecked(value);
  }

  /**
   * Selects a combobox option by visible text.
   *
   * @param field - The combobox label.
   * @param value - The option text to choose.
   * @returns A promise that resolves after the option is selected.
   */
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

  /**
   * Uploads files to a file input.
   *
   * @param field - The file input label.
   * @param value - File paths to upload.
   * @returns A promise that resolves after files are assigned to the input.
   */
  async fillFile(field: string, value: string[]) {
    await this.getInput(field).setInputFiles(value);
  }

  /**
   * Fills a text-like input.
   *
   * @param field - The input label.
   * @param value - Text or numeric value to enter.
   * @returns A promise that resolves after the input is filled.
   */
  async fillText(field: string, value: string | number) {
    await this.getInput(field).fill("" + value);
  }

  /**
   * Reads the current validation error message associated with a field.
   *
   * @param field - The input label.
   * @returns The visible error message, or `undefined` when no message is shown.
   */
  async getErrorMessage(field: string): Promise<string | undefined> {
    const errorId =
      await this.getInput(field).getAttribute("aria-errormessage");
    const error = this.root.locator(`#${errorId}`);

    if (!(await error.isVisible())) {
      return undefined;
    }

    return (await error.textContent()) || undefined;
  }

  /**
   * Resolves an input locator using label or placeholder text.
   *
   * @param field - The input label.
   * @returns The first matching input locator by label or placeholder.
   */
  private getInput(field: string) {
    return this.root
      .getByLabel(this.getLabelRegExp(field))
      .or(this.root.getByPlaceholder(this.getLabelRegExp(field)))
      .first();
  }

  /**
   * Builds a case-insensitive regex for optional-required labels.
   *
   * @param field - Field name in phrase or camel case.
   * @returns A case-insensitive label regex that tolerates trailing required markers.
   */
  private getLabelRegExp(field: string) {
    return new RegExp(
      `^${field.includes(" ") ? field : toPhrase(field)}\\s*\\*?$`,
      "i",
    );
  }

  /**
   * Returns option role used by combobox list containers.
   *
   * @param role - Parent options container role.
   * @returns The child option role used to select an item.
   */
  private optionRoleFor(role: string) {
    if (role === "tree") return "treeitem";
    return "option";
  }
}
