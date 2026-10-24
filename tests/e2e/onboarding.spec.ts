import {expect, test} from "./fixtures";

// a google user who hasn't chosen a username yet
test.describe("choosing a username", () => {
    test("is required before using the site", async ({ page, visit, factories, loginAs }) => {
        await loginAs(await factories.createUser({ username: null, plainPassword: null }));

        await visit("/builds");
        await expect(page).toHaveURL("/complete_profile");
        await expect(page.getByRole("heading", { name: "Choose a Username" })).toBeVisible();
    });

    test("rejects an invalid username", async ({ page, visit, factories, loginAs }) => {
        await loginAs(await factories.createUser({ username: null, plainPassword: null }));

        await visit("/complete_profile");
        await page.getByLabel("Username:").fill("bad_name");
        await page.getByRole("button", { name: "Continue", exact: true }).click();

        await expect(page.getByText(/alphanumerical characters and spaces/)).toBeVisible();
        await expect(page).toHaveURL("/complete_profile");
    });

    test("saves the username and lets the user in", async ({ page, visit, db, factories, loginAs }) => {
        const user = await factories.createUser({ username: null, plainPassword: null });
        await loginAs(user);

        await visit("/complete_profile");
        await page.getByLabel("Username:").fill("Fresh Member");
        await page.getByRole("button", { name: "Continue", exact: true }).click();

        await expect(page).toHaveURL("/");
        await expect(page.getByRole("link", { name: "Fresh Member", exact: true })).toBeVisible();
        expect((await db.user.findUniqueOrThrow({ where: { id: user.id } })).username).toBe("Fresh Member");

        // the refreshed session lets them through the middleware now
        await visit("/builds");
        await expect(page).toHaveURL("/builds");
    });
});
