import {execSync} from "child_process";
import path from "path";
import {PrismaClient} from "@prisma/client";

const root = path.resolve(__dirname, "../..");

// drop and re-apply all migrations on the test database
export function resetTestDatabase() {
    execSync("npx prisma migrate reset --force --skip-seed --skip-generate", {
        cwd: root,
        env: process.env,
        stdio: "pipe",
    });
}

// empty every table between tests, much faster than a full reset
export async function truncateAllTables(prisma: PrismaClient) {
    await prisma.$executeRawUnsafe(
        'TRUNCATE TABLE "Account", "Comment", "Like", "Photo", "Build", "User" RESTART IDENTITY CASCADE'
    );
}
