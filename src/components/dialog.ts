import { Locator, Page } from "playwright";

/**
 * Page component that Represents a dialog.
 *
 * @example
 * ```
 * export class MyPage {
 *  readonly myDialog: DialogComponent;
 *
 *  constructor(page: Page) {
 *    this.myDialog = new DialogComponent(page.getByRole("dialog"));
 *  }
 * }
 *
 * const myPage = new MyPage(page);
 * await expect(myPage.myDialog.headingTitle).toHaveText("My Dialog");
 * ```
 */
export class DialogComponent {
  private readonly page: Page;

  readonly root: Page | Locator;
  readonly headingTitle: Locator;
  readonly closeButton: Locator;
  readonly actionButton: Locator;
  readonly cancelButton: Locator;

  constructor(root: Page | Locator) {
    this.page = "page" in root ? root.page() : root;
    this.root = root;
    this.headingTitle = root.getByRole("heading").nth(0);
    this.closeButton = root.getByRole("button", { name: "close" });
    this.actionButton = root.locator("button[type='submit']");
    this.cancelButton = root.getByRole("button", { name: "cancel" });
  }

  /**
   * Clicks the button in this dialog with the given accessible name.
   *
   * @param name - The accessible name of the button. (case insensitive)
   *
   * @example
   * ```
   * // clicks the dialog button with accessible name "create".
   * await myDialog.click("create");
   * ```
   */
  async click(name: string) {
    await this.root.getByRole("button", { name }).click();
  }
}
