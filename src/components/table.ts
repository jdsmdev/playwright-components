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
   * Returns the Locator for a column header by text.
   *
   * @param text - The column header text or accessible name. (case insensitive)
   *
   * @example
   * ```
   * const myColumnHeader: Locator = myTable.getColumnHeader("name");
   * ```
   */
  getColumnHeader(text: string): Locator {
    return this.tableHeader.getByRole("columnheader", { name: text });
  }

  /**
   * Returns the Locator for each column header.
   *
   * @example
   * ```
   * const allColumnHeaders: Locator = await myTable.getColumnHeaders();
   * ```
   */
  async getColumnHeaders(): Promise<Locator> {
    const headers = this.tableHeader.getByRole("columnheader", {
      includeHidden: true,
    });

    if ((await headers.count()) > 0) return headers;
    return this.tableHeader.getByRole("cell");
  }

  /**
   * For those tables that allow sorting on the column header.
   *
   * @param column - The column header text or accessible name. (case insensitive)
   *
   * @example
   * ```
   * await myTable.sortBy("age");
   * ```
   */
  async sortBy(column: string) {
    await this.getColumnHeader(column).click();
  }

  /**
   * Returns the Locator for a table body row.
   *
   * @param text - The partial row text or accessible name. (case insensitive)
   *
   * @example
   * ```
   * const myRow: Locator = myTable.getBodyRow("jane doh");
   * ```
   */
  getBodyRow(text: string): Locator {
    return this.page.getByRole("row", { name: text });
  }

  /**
   * Returns table body cells as a matrix of trimmed text values.
   *
   * @returns A two-dimensional array where each inner array represents one body row.
   */
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

  /**
   * Returns body rows as maps keyed by camelCased column headers.
   *
   * @returns A list of maps where keys are header names and values are cell texts.
   */
  async getBodyRowsAsMaps(): Promise<Map<string, string>[]> {
    const columns: string[] = await (
      await this.getColumnHeaders()
    ).allTextContents();
    const cells: string[][] = await this.getBodyCellTexts();

    return cells.map((row: string[]) =>
      columns.reduce((prev, curr, i) => {
        prev.set(toCamelCase(curr), row[i]);
        return prev;
      }, new Map<string, string>()),
    );
  }

  /**
   * Returns body rows as typed objects keyed by camelCased column headers.
   *
   * @typeParam T - The expected row shape.
   * @returns A list of typed row objects.
   */
  async getBodyRowsAs<T extends Record<string, string>>(): Promise<T[]> {
    const columns: string[] = await (
      await this.getColumnHeaders()
    ).allTextContents();
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

  /**
   * Returns how many rows are currently configured to display per page.
   */
  async howManyRows(): Promise<number> {
    return Number(await this.showHowMany.textContent());
  }

  /**
   * Sets how many rows should be displayed per page.
   *
   * @param numberOfRows - The number of rows to display.
   */
  async showRows(numberOfRows: number) {
    await this.showHowMany.click();
    await this.tooltip
      .getByRole("listbox")
      .getByRole("listitem", { name: String(numberOfRows) })
      .click();
  }

  /**
   * Returns the currently selected page number.
   */
  async getCurrentPage(): Promise<number> {
    return Number(await this.currentPage.inputValue());
  }

  /**
   * Returns the button that navigates to the first page.
   */
  getFirstPage(): Locator {
    return this.getPageButton("First");
  }

  /**
   * Returns the button that navigates to the previous page.
   */
  getPrevPage(): Locator {
    return this.getPageButton("Previous");
  }

  /**
   * Returns the button that navigates to the next page.
   */
  getNextPage(): Locator {
    return this.getPageButton("Next");
  }

  /**
   * Returns the button that navigates to the last page.
   */
  getLastPage(): Locator {
    return this.getPageButton("Last");
  }

  /**
   * Clicks the first-page navigation button.
   */
  async goToFirstPage() {
    await this.clickPageButton("First");
  }

  /**
   * Clicks the previous-page navigation button.
   */
  async goToPrevPage() {
    await this.clickPageButton("Previous");
  }

  /**
   * Clicks the next-page navigation button.
   */
  async goToNextPage() {
    await this.clickPageButton("Next");
  }

  /**
   * Clicks the last-page navigation button.
   */
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
