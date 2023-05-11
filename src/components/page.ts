import { Page } from "playwright";

export class ComponentPage {
  readonly page: Page;
  readonly url: string;

  constructor(page: Page, url: string) {
    this.page = page;
    this.url = url;
  }

  async goto() {
    this.page.goto(this.url);
    this.page.waitForLoadState();
  }
}
