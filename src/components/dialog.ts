import { Locator, Page } from "playwright";

export class DialogComponent {
  readonly page: Page;
  readonly headingTitle: Locator;
  readonly closeButton: Locator;
  readonly actionButton: Locator;
  readonly cancelButton: Locator;

  constructor(root: Page | Locator) {
    this.page = "page" in root ? root.page() : root;
    this.headingTitle = root.getByRole("heading").nth(0);
    this.closeButton = root.getByRole("button", { name: "Close" });
    this.actionButton = root.locator("button[type='submit']");
    this.cancelButton = root.getByRole("button", { name: "Cancel" });
  }
}
