import {defineConfig} from "vitest/config";
import {fileURLToPath} from "url";

export default defineConfig({
    resolve: {
        alias: {
            "@": fileURLToPath(new URL(".", import.meta.url)).replace(/\/$/, ""),
        },
    },
    test: {
        environment: "node",
        include: ["tests/unit/**/*.test.ts", "tests/integration/**/*.test.ts"],
        globalSetup: ["tests/setup/globalSetup.ts"],
        setupFiles: ["tests/setup/loadEnv.ts", "tests/setup/setup.ts"],
        // every file shares one test database
        fileParallelism: false,
        testTimeout: 20000,
        hookTimeout: 60000,
    },
});
