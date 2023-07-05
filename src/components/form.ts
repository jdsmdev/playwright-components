import { Locator, Page } from "playwright";
import { toPhrase } from "../utils";

export type Entity = { [key: string]: string | Entity | undefined };

export class FormComponent {
  readonly page: Page;
  readonly submitButton: Locator;
  readonly cancelButton: Locator;

  constructor(root: Page | Locator) {
    this.page = "page" in root ? root.page() : root;
    this.submitButton = root.locator("button[type='submit']");
    this.cancelButton = root.getByRole("button", { name: "Cancel" });
  }

  async fillOne(field: string, value?: string | Entity) {
    if (!value) {
      return;
    }

    await (typeof value === "string"
      ? this.page.getByLabel(toPhrase(field)).fill(value)
      : this.fillAll(value));
  }

  async fillAll(entity: Entity) {
    for (const key of Object.keys(entity)) {
      await this.fillOne(key, entity[key]);
    }
  }
}
