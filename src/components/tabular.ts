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

  abstract getColumnHeader(text: string): Locator;
  abstract getColumnHeaders(): Promise<Locator>;
  abstract sortBy(column: string): Promise<void>;
  abstract getBodyRow(text: string): Locator;
  abstract getBodyCellTexts(): Promise<string[][]>;

  async getBodyRowsAsMaps(): Promise<Map<string, string>[]> {
    const columns: string[] = await (
      await this.getColumnHeaders()
    ).allTextContents();
    const cells: string[][] = await this.getBodyCellTexts();

    return cells.map((row: string[]) =>
      columns.reduce((prev, curr, i) => {
        const key = toCamelCase(curr.trim());
        if (key) prev.set(key, row[i] ?? "");
        return prev;
      }, new Map<string, string>()),
    );
  }

  async getBodyRowsAs<T extends Record<string, string>>(): Promise<T[]> {
    const columns: string[] = await (
      await this.getColumnHeaders()
    ).allTextContents();
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

  async howManyRows(): Promise<number> {
    const input = await this.showHowMany.inputValue().catch(() => null);
    if (input !== null) return Number(input);

    const text = await this.showHowMany.textContent();
    return Number(text?.trim() ?? 0);
  }

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

  async getCurrentPage(): Promise<number> {
    const input = await this.currentPage.inputValue().catch(() => null);
    if (input !== null) return Number(input);

    const text = await this.currentPage.textContent();
    return Number(text?.trim() ?? 0);
  }

  getFirstPage(): Locator {
    return this.firstPageLocator;
  }

  getPrevPage(): Locator {
    return this.previousPageLocator;
  }

  getNextPage(): Locator {
    return this.nextPageLocator;
  }

  getLastPage(): Locator {
    return this.lastPageLocator;
  }

  async goToFirstPage(): Promise<void> {
    await this.firstPageLocator.click();
  }

  async goToPrevPage(): Promise<void> {
    await this.previousPageLocator.click();
  }

  async goToNextPage(): Promise<void> {
    await this.nextPageLocator.click();
  }

  async goToLastPage(): Promise<void> {
    await this.lastPageLocator.click();
  }
}
