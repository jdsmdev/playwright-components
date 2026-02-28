# Identified Improvement Backlog

## 1) Fix spelling issues (documentation)
- **Detected issue:** the README contains writing mistakes that hurt clarity and credibility, such as `abliges` and `to you web testing`.
- **Impact:** confusion for new users and less professional documentation.
- **Proposed task:** review and fix spelling/grammar in `README.md`, preserving the original intent and standardizing technical English.
- **Acceptance criteria:** README has no obvious spelling mistakes in the introduction and installation sections.

## 2) Fix functional bug in form filling
- **Detected issue:** `fillOne` returns early with `if (!value)`, which incorrectly skips valid values like `false`, `0`, and an empty string.
- **Impact:** it is not possible to explicitly fill standalone boolean fields with `false`, numeric fields with `0`, or text inputs with an empty string.
- **Proposed task:** change the guard to ignore only `undefined` (and optionally `null`, if the API intends to), while preserving handling for `false`, `0`, and `""`.
- **Acceptance criteria:** `fillOne("iCanDrive", false)`, `fillOne("age", 0)`, and `fillOne("name", "")` execute without an incorrect early return.

## 3) Fix code comment / inline documentation discrepancy
- **Detected issue:** JSDoc comments in components use misspelled terms (`acessible`, `insencitive`) that can mislead API users.
- **Impact:** less reliable API documentation for developers using IntelliSense and examples.
- **Proposed task:** review JSDoc in `src/components/dialog.ts` and `src/components/table.ts`, correcting terms to `accessible` and `insensitive`, plus minor wording improvements.
- **Acceptance criteria:** JSDoc comments in those files are free of spelling issues and examples remain coherent.

## 4) Improve test coverage to prevent regression
- **Detected issue:** there is no explicit test validating `fillOne` behavior with falsy values (`false`, `0`, `""`).
- **Impact:** regressions in this behavior may go unnoticed.
- **Proposed task:** add cases in `tests/components/form/form.spec.ts` covering `fillOne` with `false` and `0`; optionally include empty string where meaningful for the fixture HTML.
- **Acceptance criteria:** new tests fail before the bug fix and pass after the guard logic is corrected.
