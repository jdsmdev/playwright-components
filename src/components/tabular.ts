import { Locator, Page } from "playwright";
import { toCamelCase } from "../utils";

interface TabularPaginationOptions {
  readonly showHowMany?: Locator;
  readonly tooltip?: Locator;
  readonly currentPage?: Locator;
  readonly firstPage?: Locator;
  readonly previousPage?: Locator;
  readonly nextPage?: Locator;
  readonly lastPage?: Locator;
}

/** Shared behavior for accessible table and grid page components. */
export abstract class TabularComponent {
  readonly page: Page;
  readonly root: Page | Locator;
  readonly showHowMany: Locator;
  readonly tooltip: Locator;
  readonly currentPage: Locator;

  readonly firstPageLocator: Locator;
  readonly previousPageLocator: Locator;
  readonly nextPageLocator: Locator;
  readonly lastPageLocator: Locator;

  constructor(root: Page | Locator, options: TabularPaginationOptions = {}) {
    this.root = root;
    this.page = "page" in root ? root.page() : root;

    this.showHowMany =
      options.showHowMany ??
      this.page.getByRole("combobox", {
        name: /select how many to display|rows per page|page size/i,
      });
    this.tooltip = options.tooltip ?? this.page.getByRole("tooltip");
    this.currentPage =
      options.currentPage ??
      this.page.getByRole("spinbutton", {
        name: /current page|page number/i,
      });

    this.firstPageLocator =
      options.firstPage ??
      this.page.getByRole("button", { name: /^(first page|first)$/i });
    this.previousPageLocator =
      options.previousPage ??
      this.page.getByRole("button", {
        name: /^(previous page|previous|prev)$/i,
      });
    this.nextPageLocator =
      options.nextPage ??
      this.page.getByRole("button", { name: /^(next page|next)$/i });
    this.lastPageLocator =
      options.lastPage ??
      this.page.getByRole("button", { name: /^(last page|last)$/i });
  }

  /**
   * Returns the locator for a column header by text or accessible name.
   * @param text - Header text or accessible name to find.
   * @returns A locator for the matching column header.
   */
  abstract getColumnHeader(text: string): Locator;

  /**
   * Returns the locator for all currently rendered column headers.
   * @returns A locator containing the ordered column headers.
   */
  abstract getColumnHeaders(): Promise<Locator>;

  /**
   * Sorts the tabular data by a named column.
   * @param column - Column text or accessible name.
   * @example
   * ```ts
   * await component.sortBy("Name");
   * ```
   */
  abstract sortBy(column: string): Promise<void>;

  /**
   * Returns a body row containing the supplied text or accessible name.
   * @param text - Text or accessible name that identifies the row.
   * @returns A locator for the matching body row.
   * @example
   * ```ts
   * await expect(component.getBodyRow("Jane Doe")).toBeVisible();
   * ```
   */
  abstract getBodyRow(text: string): Locator;

  /**
   * Returns body cells as a two-dimensional matrix of trimmed text values.
   * @returns Each inner array represents one currently rendered body row.
   * @remarks Virtualized grids return only rows and cells rendered in the DOM.
   */
  abstract getBodyCellTexts(): Promise<string[][]>;

  /**
   * Returns body rows as maps keyed by camel-cased column headers.
   *
   * If the component does not render header cells, pass the headers explicitly.
   * Supplied headers must match the rendered cell order exactly. Empty header names
   * are ignored, and missing or extra cells are mapped as an empty string or ignored.
   *
   * @param headers - Optional ordered headers. When omitted, headers are discovered
   * from the rendered component.
   * @returns A list of maps containing trimmed cell values.
   * @remarks Only currently rendered rows and cells are returned. Virtualized grids
   * may therefore require pagination or virtualization to be disabled for complete data.
   * @example
   * ```ts
   * // Headerless table or grid
   * const rows = await component.getBodyRowsAsMaps(["First Name", "Last Name"]);
   * const firstName = rows[0].get("firstName");
   * ```
   */
  async getBodyRowsAsMaps(
    headers?: readonly string[],
  ): Promise<Map<string, string>[]> {
    const columns: string[] = headers
      ? [...headers]
      : await (await this.getColumnHeaders()).allTextContents();
    const cells: string[][] = await this.getBodyCellTexts();

    return cells.map((row: string[]) =>
      columns.reduce((prev, curr, i) => {
        const key = toCamelCase(curr.trim());
        if (key) prev.set(key, row[i] ?? "");
        return prev;
      }, new Map<string, string>()),
    );
  }

  /**
   * Returns body rows as typed objects keyed by camel-cased column headers.
   *
   * If the component does not render header cells, pass the headers explicitly.
   * Supplied headers must match the rendered cell order exactly. Empty header names
   * are ignored, and missing or extra cells are mapped as an empty string or ignored.
   *
   * @param headers - Optional ordered headers. When omitted, headers are discovered
   * from the rendered component.
   * @typeParam T - The expected row shape.
   * @returns A list of typed objects containing trimmed cell values.
   * @remarks Only currently rendered rows and cells are returned. Virtualized grids
   * may therefore require pagination or virtualization to be disabled for complete data.
   * @example
   * ```ts
   * type User = { firstName: string; lastName: string };
   *
   * // Headerless table or grid
   * const users = await component.getBodyRowsAs<User>(["First Name", "Last Name"]);
   * ```
   */
  async getBodyRowsAs<T extends Record<string, string>>(
    headers?: readonly string[],
  ): Promise<T[]> {
    const columns: string[] = headers
      ? [...headers]
      : await (await this.getColumnHeaders()).allTextContents();
    const cells: string[][] = await this.getBodyCellTexts();

    return cells.map((row: string[]) => {
      const obj: Record<string, string> = {};
      columns.forEach((column, i) => {
        const key = toCamelCase(column);
        if (key) obj[key] = row[i] ?? "";
      });
      return obj as T;
    });
  }

  /**
   * Returns how many rows are configured to display per page.
   * @returns The configured page-size value as a number.
   * @example
   * ```ts
   * expect(await component.howManyRows()).toBe(25);
   * ```
   */
  async howManyRows(): Promise<number> {
    const input = await this.showHowMany.inputValue().catch(() => null);
    if (input !== null) return Number(input);

    const text = await this.showHowMany.textContent();
    return Number(text?.trim() ?? 0);
  }

  /**
   * Sets how many rows should be displayed per page.
   * @param numberOfRows - Page size to select.
   * @example
   * ```ts
   * await component.showRows(25);
   * ```
   */
  async showRows(numberOfRows: number): Promise<void> {
    const isSelect = await this.showHowMany
      .evaluate((element) => element instanceof HTMLSelectElement)
      .catch(() => false);

    if (isSelect) {
      await this.showHowMany.selectOption(String(numberOfRows));
      return;
    }

    await this.showHowMany.click();

    const option = this.tooltip
      .getByRole("option", { name: String(numberOfRows) })
      .or(
        this.tooltip
          .getByRole("listbox")
          .getByRole("option", { name: String(numberOfRows) }),
      )
      .or(this.tooltip.getByRole("listitem", { name: String(numberOfRows) }))
      .or(this.tooltip.getByText(String(numberOfRows), { exact: true }))
      .or(this.page.getByText(String(numberOfRows), { exact: true }));

    await option.click();
  }

  /**
   * Returns the currently selected page number.
   * @returns The current page number.
   * @example
   * ```ts
   * expect(await component.getCurrentPage()).toBe(3);
   * ```
   */
  async getCurrentPage(): Promise<number> {
    const input = await this.currentPage.inputValue().catch(() => null);
    if (input !== null) return Number(input);

    const text = await this.currentPage.textContent();
    return Number(text?.trim() ?? 0);
  }

  /** Returns the locator for the first-page navigation control. */
  getFirstPage(): Locator {
    return this.firstPageLocator;
  }

  /** Returns the locator for the previous-page navigation control. */
  getPrevPage(): Locator {
    return this.previousPageLocator;
  }

  /** Returns the locator for the next-page navigation control. */
  getNextPage(): Locator {
    return this.nextPageLocator;
  }

  /** Returns the locator for the last-page navigation control. */
  getLastPage(): Locator {
    return this.lastPageLocator;
  }

  /** Clicks the first-page navigation control. */
  async goToFirstPage(): Promise<void> {
    await this.firstPageLocator.click();
  }

  /** Clicks the previous-page navigation control. */
  async goToPrevPage(): Promise<void> {
    await this.previousPageLocator.click();
  }

  /** Clicks the next-page navigation control. */
  async goToNextPage(): Promise<void> {
    await this.nextPageLocator.click();
  }

  /** Clicks the last-page navigation control. */
  async goToLastPage(): Promise<void> {
    await this.lastPageLocator.click();
  }
}
