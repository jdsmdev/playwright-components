import { Locator, Page } from "playwright";
import { toCamelCase } from "../utils";

/**
 * Page component that Represents a table.
 *
 * @example
 * ```
 * export class MyPage {
 *  readonly myTable: TableComponent;
 *
 *  constructor(page: Page) {
 *    this.myTable = new TableComponent(page.getByRole("table"));
 *  }
 * }
 *
 * const myPage = new MyPage(page);
 * const myUsers: User[] = await myPage.myTable.getBodyRowsAs();
 * expect(myUsers).toHaveLength(5);
 * ```
 */
export class TableComponent {
  readonly page: Page;
  readonly rows: Locator;
  readonly tableHeader: Locator;
  readonly showHowMany: Locator;
  readonly tooltip: Locator;
  readonly currentPage: Locator;

  constructor(root: Page | Locator) {
    this.page = "page" in root ? root.page() : root;
    this.rows = root.getByRole("row");
    this.tableHeader = this.rows.nth(0);
    this.showHowMany = this.page.getByRole("combobox", {
      name: "select how many to display",
    });
    this.tooltip = this.page.getByRole("tooltip");
    this.currentPage = this.page.getByRole("spinbutton", {
      name: "current page",
    });
  }

  /**
   * Returns the Locator for a column header.
   *
   * @param text - The column header text or acessible name. (case insencitive)
   *
   * @example
   * ```
   * const myColumnHeader: Locator = myTable.getColumnHeader("name");
   * ```
   */
  getColumnHeader(text: string): Locator {
    return this.tableHeader.getByRole("columnheader", { name: text });
  }

  async sortBy(column: string) {
    await this.getColumnHeader(column).click();
  }

  /**
   * Returns the Locator for a table body row.
   *
   * @param text - The partial row text or acessible name. (case insencitive)
   *
   * @example
   * ```
   * const myRow: Locator = myTable.getBodyRow("jane doh");
   * ```
   */
  getBodyRow(text: string): Locator {
    return this.page.getByRole("row", { name: text });
  }

  async getBodyCellTexts(): Promise<string[][]> {
    const rows: Locator[] = await this.rows.all();
    rows.shift();

    return Promise.all(
      rows.map(async (row) =>
        (await row.getByRole("cell").allTextContents()).map((cell) =>
          cell.trim(),
        ),
      ),
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
      }, new Map<string, string>()),
    );
  }

  async getBodyRowsAs<T extends Record<string, string>>(): Promise<T[]> {
    const columns: string[] = await this.tableHeader
      .getByRole("columnheader", { includeHidden: true })
      .allTextContents();

    const cells: string[][] = await this.getBodyCellTexts();

    const objs: T[] = [];

    cells.forEach((row: string[]) => {
      const obj: Record<string, string> = {};
      columns.forEach((col, i) => {
        if (col.trim().length > 0) obj[toCamelCase(col)] = row[i];
      });
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
    return Number(await this.currentPage.inputValue());
  }

  getFirstPage(): Locator {
    return this.getPageButton("First");
  }

  getPrevPage(): Locator {
    return this.getPageButton("Previous");
  }

  getNextPage(): Locator {
    return this.getPageButton("Next");
  }

  getLastPage(): Locator {
    return this.getPageButton("Last");
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

  private getPageButton(page: string): Locator {
    return this.page.getByRole("button", { name: `${page} Page` });
  }

  private async clickPageButton(page: string) {
    await this.getPageButton(page).click();
  }
}
