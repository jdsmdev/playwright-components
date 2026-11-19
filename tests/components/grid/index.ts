import { Page } from "playwright/test";
import { GridComponent } from "../../../src";

export class GridPage {
  readonly grid: GridComponent;

  constructor(page: Page) {
    this.grid = new GridComponent(page.getByRole("grid"), {
      showHowMany: page.locator("#page-size"),
      currentPage: page.getByRole("spinbutton", { name: "Current page" }),
    });
  }
}
