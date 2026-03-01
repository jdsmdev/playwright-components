import { Locator, Page } from "playwright";
import { toCamelCase } from "../utils";

/**
 * Page component that represents a table.
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

  /**
   * Creates a table component from a page or table root locator.
   *
   * @param root - The page or locator scoped to the table container.
   */
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
   * Returns the locator for a column header.
   *
   * @param text - The column header text or accessible name. (case insensitive)
   * @returns The matching column header locator.
   */
  getColumnHeader(text: string): Locator {
    return this.tableHeader.getByRole("columnheader", { name: text });
  }

  /**
   * Returns all column header locators.
   *
   * Falls back to `cell` role when `columnheader` is not present.
   * @returns A locator containing column header cells.
   */
  async getColumnHeaders(): Promise<Locator> {
    const headers = this.tableHeader.getByRole("columnheader", {
      includeHidden: true,
    });

    if ((await headers.count()) > 0) return headers;
    return this.tableHeader.getByRole("cell");
  }

  /**
   * Sorts the table by clicking a specific column header.
   *
   * @param column - The column name to sort by.
   * @returns A promise that resolves after the sort action click is issued.
   */
  async sortBy(column: string) {
    await this.getColumnHeader(column).click();
  }

  /**
   * Returns the locator for a table body row.
   *
   * @param text - The partial row text or accessible name. (case insensitive)
   * @returns The matching row locator.
   */
  getBodyRow(text: string): Locator {
    return this.page.getByRole("row", { name: text });
  }

  /**
   * Returns text values for all body cells.
   *
   * @returns Nested arrays where each inner array contains one row's cell text.
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
   * Returns body rows as a list of string maps keyed by camel-cased headers.
   * @returns An array of maps where each map represents one row.
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
   * Returns body rows as typed objects keyed by camel-cased headers.
   * @returns An array of typed row objects.
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
   * Returns the currently selected row count in the rows-per-page control.
   * @returns The selected number of rows to display per page.
   */
  async howManyRows(): Promise<number> {
    return Number(await this.showHowMany.textContent());
  }

  /**
   * Changes the rows-per-page setting.
   *
   * @param numberOfRows - The number of rows to display.
   * @returns A promise that resolves after the rows-per-page option is selected.
   */
  async showRows(numberOfRows: number) {
    await this.showHowMany.click();
    await this.tooltip
      .getByRole("listbox")
      .getByRole("listitem", { name: String(numberOfRows) })
      .click();
  }

  /**
   * Returns the current table page number.
   * @returns The current page number from the paginator input.
   */
  async getCurrentPage(): Promise<number> {
    return Number(await this.currentPage.inputValue());
  }

  /**
   * Returns the "First Page" button.
   * @returns The locator for the first-page paginator button.
   */
  getFirstPage(): Locator {
    return this.getPageButton("First");
  }

  /**
   * Returns the "Previous Page" button.
   * @returns The locator for the previous-page paginator button.
   */
  getPrevPage(): Locator {
    return this.getPageButton("Previous");
  }

  /**
   * Returns the "Next Page" button.
   * @returns The locator for the next-page paginator button.
   */
  getNextPage(): Locator {
    return this.getPageButton("Next");
  }

  /**
   * Returns the "Last Page" button.
   * @returns The locator for the last-page paginator button.
   */
  getLastPage(): Locator {
    return this.getPageButton("Last");
  }

  /**
   * Navigates to the first page.
   * @returns A promise that resolves after the first-page button is clicked.
   */
  async goToFirstPage() {
    await this.clickPageButton("First");
  }

  /**
   * Navigates to the previous page.
   * @returns A promise that resolves after the previous-page button is clicked.
   */
  async goToPrevPage() {
    await this.clickPageButton("Previous");
  }

  /**
   * Navigates to the next page.
   * @returns A promise that resolves after the next-page button is clicked.
   */
  async goToNextPage() {
    await this.clickPageButton("Next");
  }

  /**
   * Navigates to the last page.
   * @returns A promise that resolves after the last-page button is clicked.
   */
  async goToLastPage() {
    await this.clickPageButton("Last");
  }

  /**
   * Returns a paginator button by page position label.
   *
   * @param page - Page position name, such as `First` or `Next`.
   * @returns The locator for the requested paginator button.
   */
  private getPageButton(page: string): Locator {
    return this.page.getByRole("button", { name: `${page} Page` });
  }

  /**
   * Clicks a paginator button by page position label.
   *
   * @param page - Page position name, such as `First` or `Next`.
   * @returns A promise that resolves after the paginator button is clicked.
   */
  private async clickPageButton(page: string) {
    await this.getPageButton(page).click();
  }
}
