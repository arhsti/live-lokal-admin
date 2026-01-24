// Playwright global setup to set ll_club cookie for all tests
import { FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  // No-op: we will set cookies in test.beforeEach instead for flexibility
}

export default globalSetup;
