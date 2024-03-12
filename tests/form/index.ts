import { Page } from "playwright/test";
import { FormComponent } from "../../src";

export class FormPage {
  readonly form: FormComponent;
  readonly rootForm: FormComponent;

  constructor(page: Page) {
    this.form = new FormComponent(page.locator("form"));
    this.rootForm = new FormComponent(page);
  }
}
