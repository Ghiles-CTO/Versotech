# QA + Changes (Jan 31, 2026)

## Scope
- Term sheet price-per-share display now uses numeric `price_per_share` (no `price_per_share_text` in template).
- Login build/QA: build succeeded; unit tests passing; compile issues fixed.

## Changes Applied
- Term sheet generation payload now outputs `price_per_share` (formatted) and template uses it. (No reliance on `price_per_share_text`.)
- Build fixes applied for strict TypeScript checks (types/implicit any).

## QA Performed
- Unit tests: `pnpm -C versotech-portal exec vitest run` (pass; warnings about `--localstorage-file` and `punycode`).
- Build: `pnpm -C versotech-portal build` (pass; middleware deprecation warning).

## Login Check
- Login routes compile and build successfully (no TS/build errors).
- Manual UI login verification still recommended:
  1) `/versotech/login` and `/versotech_main/login`
  2) `/versoholdings/login`
  3) Password reset flow: `/versotech_main/reset-password`

## Notes
- Build outputs a warning: “middleware file convention is deprecated; use proxy”.
