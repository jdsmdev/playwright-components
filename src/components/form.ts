import { Locator, Page } from "playwright";
import { toPhrase } from "../utils";

export type Entity = { [key: string]: FillValue | Entity };

export type FillValue = string | string[] | boolean | undefined;

export class FormComponent {
  readonly page: Page;
  readonly submitButton: Locator;
  readonly cancelButton: Locator;
  readonly cancelLink: Locator;

  constructor(root: Page | Locator) {
    this.page = "page" in root ? root.page() : root;
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

  async fillAny(field: string, value: FillValue) {
    if (typeof value === "boolean") {
      await this.fillCheckbox(field, value);
    } else if (typeof value === "string") {
      const input = this.page.getByLabel(toPhrase(field)).first();
      const role = await input.getAttribute("role");

      if (role === "combobox") {
        await this.fillCombobox(field, value);
      } else {
        await this.fillText(field, value);
      }
    } else {
      const input = this.page.getByLabel(toPhrase(field)).first();
      const type = await input.getAttribute("type");

      if (type === "file") {
        await this.fillFile(field, value);
      }
    }
  }

  async fillCheckbox(field: string, value: boolean) {
    await this.page
      .getByRole("checkbox", { name: toPhrase(field) })
      .setChecked(value);
  }

  async fillCombobox(field: string, value: string) {
    await this.page.getByRole("combobox", { name: toPhrase(field) }).click();
    await this.page.getByRole("option", { name: value }).click();
  }

  async fillFile(field: string, value: string[]) {
    await this.page.getByLabel(toPhrase(field)).setInputFiles(value);
  }

  async fillText(field: string, value: string) {
    await this.page.getByLabel(toPhrase(field)).fill(value);
  }

  async getErrorMessage(field: string): Promise<string | undefined> {
    const input = this.page.getByLabel(toPhrase(field)).first();
    const errorId = await input.getAttribute("aria-errormessage");
    const error = this.page.locator(`#${errorId}`);

    if (!(await error.isVisible())) {
      return undefined;
    }

    return await error.textContent();
  }
}
