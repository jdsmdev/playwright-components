import { Locator, Page } from "playwright";
import { TabularComponent } from "./tabular";

export interface GridComponentOptions {
  readonly rows?: Locator;
  readonly gridHeader?: Locator;
  readonly showHowMany?: Locator;
  readonly tooltip?: Locator;
  readonly currentPage?: Locator;
  readonly firstPage?: Locator;
  readonly previousPage?: Locator;
  readonly nextPage?: Locator;
  readonly lastPage?: Locator;
}

/**
 * Page component that represents an accessible grid.
 *
 * This component targets the ARIA grid contract shared by accessible grid
 * implementations: role="grid"/role="treegrid", role="row",
 * role="columnheader", and role="gridcell".
 */
export class GridComponent extends TabularComponent {
  readonly rows: Locator;
  readonly gridHeader: Locator;

  constructor(root: Page | Locator, options: GridComponentOptions = {}) {
    super(root, options);

    this.rows = options.rows ?? root.getByRole("row");
    this.gridHeader = options.gridHeader ?? this.rows.nth(0);
  }

  /** Returns a column header by accessible name or visible text. */
  getColumnHeader(text: string): Locator {
    return this.gridHeader
      .getByRole("columnheader", { name: text })
      .or(this.gridHeader.getByText(text, { exact: false }));
  }

  /** Returns the rendered column headers. */
  async getColumnHeaders(): Promise<Locator> {
    const headers = this.gridHeader.getByRole("columnheader", {
      includeHidden: true,
    });

    if ((await headers.count()) > 0) return headers;

    const gridCells = this.gridHeader.getByRole("gridcell", {
      includeHidden: true,
    });
    if ((await gridCells.count()) > 0) return gridCells;

    return this.gridHeader.getByRole("cell", { includeHidden: true });
  }

  /** Sorts a grid column by clicking its header. */
  async sortBy(column: string): Promise<void> {
    await this.getColumnHeader(column).click();
  }

  /** Returns a body row by accessible name or visible text. */
  getBodyRow(text: string): Locator {
    return this.root
      .getByRole("row", { name: text })
      .or(this.root.locator("[role='row']").filter({ hasText: text }))
      .or(this.root.locator("tr").filter({ hasText: text }));
  }

  /** Returns rendered body grid cells as a matrix of trimmed text values. */
  async getBodyCellTexts(): Promise<string[][]> {
    const rows: Locator[] = await this.rows.all();

    // The first row is assumed to contain column headers.
    if (rows.length > 0) rows.shift();

    return Promise.all(
      rows.map(async (row) => {
        const gridCells = row.getByRole("gridcell", { includeHidden: true });
        if ((await gridCells.count()) > 0) {
          return (await gridCells.allTextContents()).map((cell) => cell.trim());
        }

        const tableCells = row.getByRole("cell", { includeHidden: true });
        if ((await tableCells.count()) > 0) {
          return (await tableCells.allTextContents()).map((cell) =>
            cell.trim(),
          );
        }

        return (
          await row.locator("[role='gridcell'], td").allTextContents()
        ).map((cell) => cell.trim());
      }),
    );
  }
}
