import { Page } from "playwright/test";
import { TableComponent } from "../../../src";

export class TablePage {
  readonly table: TableComponent;
  readonly rootTable: TableComponent;

  constructor(page: Page) {
    this.table = new TableComponent(page.getByRole("table"));
    this.rootTable = new TableComponent(page);
  }
}
