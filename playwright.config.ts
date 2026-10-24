import {defineConfig, devices} from "@playwright/test";
import {loadTestEnv} from "./tests/setup/env";

// test env (and the "_test" database guard) also applies to the dev server started below
const env = loadTestEnv();
const PORT = 3100;
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
    testDir: "tests/e2e",
    // one server and one database, so specs run one at a time
    fullyParallel: false,
    workers: 1,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 1 : 0,
    reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
    globalSetup: "./tests/e2e/globalSetup.ts",
    timeout: 120_000,
    use: {
        baseURL: BASE_URL,
        trace: "retain-on-failure",
    },
    projects: [
        { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    ],
    webServer: {
        command: `npx next dev -p ${PORT}`,
        url: `${BASE_URL}/api/auth/csrf`,
        reuseExistingServer: !process.env.CI,
        timeout: 180_000,
        env: {
            ...env,
            NEXTAUTH_URL: BASE_URL,
            NEXT_PUBLIC_BASE_URL: BASE_URL,
            NEXT_DIST_DIR: ".next-e2e",
            DISABLE_RATE_LIMIT: "true",
        },
    },
});
