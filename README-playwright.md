## UI Regression Testing with Playwright

This project uses Playwright for visual regression testing to lock the UI and prevent layout/spacing regressions.

### How to Run UI Tests

1. Start your local dev server:
   
   npm run dev

2. In a separate terminal, run:
   
   npm run test:ui

- This will run all Playwright tests in /tests/visual and compare screenshots to the baseline.

### How to Update Snapshots

If you intentionally change the UI and want to update the baseline images:

    npm run test:ui:update

### When Tests Fail

- A test failure means the UI has visually changed compared to the baseline.
- Review the diff images in the Playwright report.
- If the change is expected, update the snapshots as above.
- If not, fix the regression before merging.

### Notes

- Playwright is only for UI layout, spacing, and visual correctness.
- No business logic is tested here.
- Playwright and its tests do NOT affect production builds or runtime code.
