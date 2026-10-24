import {test as base, expect, Page} from "@playwright/test";
import {encode} from "next-auth/jwt";
import type {User} from "@prisma/client";
import {prisma} from "@/lib/prisma";
import {truncateAllTables} from "../setup/db";
import * as factories from "../helpers/factories";

// the test env (and its "_test" database guard) is loaded by playwright.config.ts before this file

// sign in by setting a session cookie, the same jwt next-auth would issue
async function loginAs(page: Page, user: Pick<User, "id" | "email" | "username" | "createdAt" | "updatedAt">) {
    const token = await encode({
        token: {
            sub: user.id.toString(),
            id: user.id.toString(),
            email: user.email,
            name: user.username,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        },
        secret: process.env.NEXTAUTH_SECRET!,
    });

    await page.context().addCookies([{
        name: "next-auth.session-token",
        value: token,
        domain: "localhost",
        path: "/",
        httpOnly: true,
        sameSite: "Lax",
    }]);
}

// a build with the thumbnail every build card requires
async function createBuildWithThumbnail(userId: number, overrides: Parameters<typeof factories.createBuild>[1] = {}) {
    const build = await factories.createBuild(userId, overrides);
    await factories.createBuildPhoto(build.build_id, { isThumbnail: true });
    return build;
}

// the header shows a skeleton until the client has hydrated and loaded the session,
// clicking before then submits forms natively instead of through react
async function waitForHydration(page: Page) {
    await expect(page.locator("header .chakra-skeleton")).toHaveCount(0, { timeout: 60_000 });
}

async function visit(page: Page, path: string) {
    await page.goto(path);
    await waitForHydration(page);
}

export const test = base.extend<{
    visit: (path: string) => Promise<void>,
    waitForHydration: () => Promise<void>,
    db: typeof prisma,
    factories: typeof factories & { createBuildWithThumbnail: typeof createBuildWithThumbnail },
    loginAs: (user: Parameters<typeof loginAs>[1]) => Promise<void>,
}>({
    // every test starts from an empty database
    db: [async ({}, use) => {
        await truncateAllTables(prisma);
        await use(prisma);
    }, { auto: true }],

    factories: async ({ db }, use) => {
        await use({ ...factories, createBuildWithThumbnail });
    },

    visit: async ({ page }, use) => {
        await use((path) => visit(page, path));
    },

    // for pages that reload themselves (e.g. after liking a build)
    waitForHydration: async ({ page }, use) => {
        await use(() => waitForHydration(page));
    },

    loginAs: async ({ page }, use) => {
        await use((user) => loginAs(page, user));
    },

    page: async ({ page }, use) => {
        // build photos point at the fake bucket, don't let next/image try to fetch them
        await page.route("**/_next/image**", (route) => route.fulfill({ status: 204 }));
        await use(page);
    },
});

export {expect};
