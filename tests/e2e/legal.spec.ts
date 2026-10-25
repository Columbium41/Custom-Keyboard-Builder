import {expect, test} from "./fixtures";

// google's oauth review needs both pages to be public and linked from the home page
test.describe("legal pages", () => {
    test("are linked from the home page footer for signed out visitors", async ({ page, visit }) => {
        await visit("/");
        const footer = page.locator("footer");

        await footer.getByRole("link", { name: "Privacy Policy", exact: true }).click();
        await expect(page).toHaveURL("/privacy");
        await expect(page.getByRole("heading", { name: "Privacy Policy", level: 1 })).toBeVisible();
        await expect(page.getByRole("heading", { name: "Google user data" })).toBeVisible();
        await expect(page.getByText("Limited Use requirements")).toBeVisible();

        await footer.getByRole("link", { name: "Terms of Service", exact: true }).click();
        await expect(page).toHaveURL("/terms");
        await expect(page.getByRole("heading", { name: "Terms of Service", level: 1 })).toBeVisible();
    });

    test("show the contact email from EMAIL_USER", async ({ page, visit }) => {
        for (const path of ["/privacy", "/terms"]) {
            await visit(path);
            await expect(page.getByRole("link", { name: process.env.EMAIL_USER! }).first()).toHaveAttribute("href", `mailto:${process.env.EMAIL_USER}`);
        }
    });

    test("are linked from the sign up form", async ({ page, visit }) => {
        await visit("/signup");
        await expect(page.getByText("By signing up, you agree to our")).toBeVisible();
        await expect(page.getByRole("link", { name: "Terms of Service" }).first()).toHaveAttribute("href", "/terms");
    });

    test("can be read by a google user before they choose a username", async ({ page, visit, factories, loginAs }) => {
        await loginAs(await factories.createUser({ username: null, plainPassword: null }));

        await visit("/terms");
        await expect(page).toHaveURL("/terms");
        await expect(page.getByRole("heading", { name: "Terms of Service", level: 1 })).toBeVisible();
    });
});

test.describe("deleting an account", () => {
    test("requires typing the username, then deletes the account and signs out", async ({ page, visit, db, factories, loginAs }) => {
        // no builds: build cards need a thumbnail, and deleting photos calls s3, which isn't available in e2e.
        // cascading builds and s3 cleanup are covered by the vitest delete_account tests
        const user = await factories.createUser({ username: "Leaving User" });
        await loginAs(user);

        await visit(`/users/${encodeURIComponent("Leaving User")}`);
        await page.getByRole("button", { name: "Delete Account", exact: true }).click();

        const dialog = page.getByRole("alertdialog");
        const confirm = dialog.getByRole("button", { name: "Delete Forever", exact: true });
        await expect(confirm).toBeDisabled();
        await dialog.getByLabel(/Type Leaving User/).fill("Leaving Use");
        await expect(confirm).toBeDisabled();
        await dialog.getByLabel(/Type Leaving User/).fill("Leaving User");

        const response = page.waitForResponse("**/api/users/delete_account");
        await confirm.click();
        expect((await response).ok()).toBe(true);

        await expect(page).toHaveURL("/");
        await expect(page.getByRole("button", { name: "Sign Up", exact: true })).toBeVisible();
        expect(await db.user.findUnique({ where: { id: user.id } })).toBeNull();
    });

    test("isn't offered on someone else's profile", async ({ page, visit, factories, loginAs }) => {
        await factories.createUser({ username: "Someone Else" });
        await loginAs(await factories.createUser());

        await visit(`/users/${encodeURIComponent("Someone Else")}`);
        await expect(page.getByText("Someone Else", { exact: true })).toBeVisible();
        await expect(page.getByRole("button", { name: "Delete Account", exact: true })).toHaveCount(0);
    });
});
