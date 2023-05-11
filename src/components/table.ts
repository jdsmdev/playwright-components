import { Locator, Page } from "playwright";
import { toCamelCase } from "../utils";

export class TableComponent {
  readonly page: Page;
  readonly rows: Locator;
  readonly headerRow: Locator;
  readonly bodyRows: Locator;
  readonly showHowMany: Locator;
  readonly tooltip: Locator;
  readonly currentPage: Locator;

  constructor(root: Page | Locator) {
    this.page = "page" in root ? root.page() : root;
    this.rows = root.getByRole("row");
    this.headerRow = this.rows.nth(0);
    this.bodyRows = root.locator("tbody").getByRole("row");
    this.showHowMany = this.page.getByRole("combobox", {
      name: "Select how many to display",
    });
    this.tooltip = this.page.getByRole("tooltip");
    this.currentPage = this.page.getByRole("spinbutton", {
      name: "Current page",
    });
  }

  async getBodyRow(text: string): Promise<Locator> {
    const rowWithText = (await this.bodyRows.all()).find(
      async (row) => (await row.textContent()) === text
    );

    if (!rowWithText)
      throw new Error(`No row found on publications table with text: ${text}`);

    return rowWithText;
  }

  async getBodyCellTexts(): Promise<string[][]> {
    const rows: Locator[] = await this.bodyRows.all();
    return Promise.all(
      rows.map(async (row) => row.getByRole("cell").allTextContents())
    );
  }

  async getBodyRowsAsMaps(): Promise<Map<string, string>[]> {
    const columns: string[] = await this.headerRow
      .getByRole("columnheader")
      .allTextContents();
    const cells: string[][] = await this.getBodyCellTexts();

    return cells.map((row: string[]) =>
      columns.reduce((prev, curr, i) => {
        prev.set(toCamelCase(curr), row[i]);
        return prev;
      }, new Map<string, string>())
    );
  }

  async howManyRows(): Promise<number> {
    return Number(await this.showHowMany.textContent());
  }

  async showRows(numberOfRows: number) {
    await this.showHowMany.click();
    await this.tooltip
      .getByRole("listbox")
      .getByRole("listitem", { name: String(numberOfRows) })
      .click();
  }

  async getCurrentPage(): Promise<number> {
    return Number(await this.currentPage.textContent());
  }

  async goToFirstPage() {
    await this.clickPageButton("First");
  }

  async goToPrevPage() {
    await this.clickPageButton("Previous");
  }

  async goToNextPage() {
    await this.clickPageButton("Next");
  }

  async goToLastPage() {
    await this.clickPageButton("Last");
  }

  private async clickPageButton(page: string) {
    await this.page.getByRole("button", { name: `${page} Page` }).click();
  }
}
