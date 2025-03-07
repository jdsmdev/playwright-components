import { Page } from "playwright/test";
import { DialogComponent } from "../../../src";

export class DialogPage {
  readonly dialog: DialogComponent;
  readonly rootDialog: DialogComponent;

  constructor(page: Page) {
    this.dialog = new DialogComponent(page.getByRole("dialog"));
    this.rootDialog = new DialogComponent(page);
  }
}
