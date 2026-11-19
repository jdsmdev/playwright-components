import { Locator, Page } from "playwright";
import { TabularComponent } from "./tabular";

/**
 * Page component that represents a native accessible table.
 *
 * @example
 * ```
 * export class MyPage {
 *   readonly myTable: TableComponent;
 *
 *   constructor(page: Page) {
 *     this.myTable = new TableComponent(page.getByRole("table"));
 *   }
 * }
 *
 * const myUsers = await myPage.myTable.getBodyRowsAs();
 * ```
 */
export class TableComponent extends TabularComponent {
  readonly rows: Locator;
  readonly tableHeader: Locator;

  constructor(root: Page | Locator) {
    super(root, {
      showHowMany: ("page" in root ? root.page() : root).getByRole("combobox", {
        name: "select how many to display",
      }),
      tooltip: ("page" in root ? root.page() : root).getByRole("tooltip"),
      currentPage: ("page" in root ? root.page() : root).getByRole(
        "spinbutton",
        {
          name: "current page",
        },
      ),
    });

    this.rows = root.getByRole("row");
    this.tableHeader = this.rows.nth(0);
  }

  /** Returns a column header by text or accessible name. */
  getColumnHeader(text: string): Locator {
    return this.tableHeader.getByRole("columnheader", { name: text });
  }

  /** Returns the rendered table column headers. */
  async getColumnHeaders(): Promise<Locator> {
    const headers = this.tableHeader.getByRole("columnheader", {
      includeHidden: true,
    });

    if ((await headers.count()) > 0) return headers;
    return this.tableHeader.getByRole("cell", { includeHidden: true });
  }

  /** Sorts a table column by clicking its header. */
  async sortBy(column: string): Promise<void> {
    await this.getColumnHeader(column).click();
  }

  /** Returns a table body row by text or accessible name. */
  getBodyRow(text: string): Locator {
    return this.root.getByRole("row", { name: text });
  }

  /** Returns table body cells as a matrix of trimmed text values. */
  async getBodyCellTexts(): Promise<string[][]> {
    const rows: Locator[] = await this.rows.all();
    rows.shift();

    return Promise.all(
      rows.map(async (row) =>
        (
          await row.getByRole("cell", { includeHidden: true }).allTextContents()
        ).map((cell) => cell.trim()),
      ),
    );
  }
}
