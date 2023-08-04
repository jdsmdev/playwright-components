import { Locator, Page } from "playwright";
import { toCamelCase } from "../utils";

export class TableComponent {
  readonly page: Page;
  readonly rows: Locator;
  readonly tableHeader: Locator;
  readonly tableBody: Locator;
  readonly bodyRows: Locator;
  readonly showHowMany: Locator;
  readonly tooltip: Locator;
  readonly currentPage: Locator;

  constructor(root: Page | Locator) {
    this.page = "page" in root ? root.page() : root;
    this.rows = root.getByRole("row");
    this.tableHeader = this.rows.nth(0);
    this.tableBody = root.locator("tbody");
    this.bodyRows = root.locator("tbody").getByRole("row");
    this.showHowMany = this.page.getByRole("combobox", {
      name: "select how many to display",
    });
    this.tooltip = this.page.getByRole("tooltip");
    this.currentPage = this.page.getByRole("spinbutton", {
      name: "current page",
    });
  }

  getColumnHeader(text: string): Locator {
    return this.tableHeader.getByRole("columnheader", { name: text });
  }

  async sortBy(column: string) {
    await this.getColumnHeader(column).click();
  }

  async getBodyRow(text: string): Promise<Locator> {
    return this.page.locator(`tr:has-text("${text}")`);
  }

  async getBodyCellTexts(): Promise<string[][]> {
    const rows: Locator[] = await this.bodyRows.all();
    return Promise.all(
      rows.map(async (row) => row.getByRole("cell").allTextContents())
    );
  }

  async getBodyRowsAsMaps(): Promise<Map<string, string>[]> {
    const columns: string[] = await this.tableHeader
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

  async getBodyRowsAs<T extends Record<string, string>>(): Promise<T[]> {
    const columns: string[] = await this.tableHeader
      .getByRole("columnheader")
      .allTextContents();
    const cells: string[][] = await this.getBodyCellTexts();

    const objs: T[] = [];

    cells.forEach((row: string[]) => {
      const obj: Record<string, string> = {};
      columns.forEach((col, i) => (obj[toCamelCase(col)] = row[i]));
      objs.push(obj as T);
    });

    return objs;
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
