# `playwright-components`

> TODO: description

## Usage

```
import { Locator, Page } from "@playwright/test";
import { TableComponent } from "playwright-components";

export class MyPage {
  readonly page: Page;
  readonly myButton: Locator;
  readonly myTable: TableComponent;

  constructor(page: Page) {
    this.page = page;
    this.myButton = page.getByRole("button", { name: "My Button" });
    this.table = new TableComponent(page.getByRole("table"));
  }

  async goto() {
    await this.page.goto("/my-page");
  }

  async isFileVisible(fileName: string): Promise<boolean> {
    return !!(await this.table.getBodyRowsAsMaps()).find(
      (row) => row.get("fileName") === fileName,
    );
  }
}
```
