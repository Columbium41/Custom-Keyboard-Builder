import fs from "fs";
import path from "path";
import {parse} from "dotenv";

const root = path.resolve(__dirname, "../..");

const readEnvFile = (file: string) => {
    const filePath = path.join(root, file);
    return fs.existsSync(filePath) ? parse(fs.readFileSync(filePath)) : {};
};

// load .env.test, then .env.test.local, then real environment variables (highest priority, used by CI).
// returns the merged values and applies them to process.env
export function loadTestEnv() {
    const merged: Record<string, string> = {
        ...readEnvFile(".env.test"),
        ...readEnvFile(".env.test.local"),
    };

    for (const key of Object.keys(merged)) {
        if (process.env[key] !== undefined) {
            merged[key] = process.env[key]!;
        }
        process.env[key] = merged[key];
    }

    assertTestDatabase(merged.DATABASE_URL);
    assertTestDatabase(merged.DIRECT_URL);

    return merged;
}

// tests truncate every table, never let them run against a non-test database
function assertTestDatabase(url: string | undefined) {
    const dbName = url ? new URL(url).pathname.replace(/^\//, "") : "";

    if (!dbName.endsWith("_test")) {
        throw new Error(`Refusing to run tests: database "${dbName}" does not end in "_test". Check .env.test / .env.test.local.`);
    }
}
