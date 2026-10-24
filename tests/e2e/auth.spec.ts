import {expect, test} from "./fixtures";

test.describe("password sign in", () => {
    test("signs in with a username and shows it in the header", async ({ page, visit, factories }) => {
        await factories.createUser({ username: "Keyboard Fan" });

        await visit("/signin");
        await page.getByLabel("Username or Email:").fill("Keyboard Fan");
        await page.getByLabel("Password:").fill(factories.DEFAULT_PASSWORD);
        await page.locator("form").getByRole("button", { name: "Login", exact: true }).click();

        await expect(page).toHaveURL("/");
        await expect(page.getByRole("link", { name: "Keyboard Fan", exact: true })).toBeVisible();
    });

    test("shows an error for a wrong password", async ({ page, visit, factories }) => {
        const user = await factories.createUser();

        await visit("/signin");
        await page.getByLabel("Username or Email:").fill(user.email);
        await page.getByLabel("Password:").fill("wrongpassword");
        await page.locator("form").getByRole("button", { name: "Login", exact: true }).click();

        await expect(page.getByText("Sign In failed, please check your credentials.")).toBeVisible();
        await expect(page).toHaveURL("/signin");
    });

    test("tells unverified users to verify their email", async ({ page, visit, factories }) => {
        const user = await factories.createUser({ verified: false });

        await visit("/signin");
        await page.getByLabel("Username or Email:").fill(user.email);
        await page.getByLabel("Password:").fill(factories.DEFAULT_PASSWORD);
        await page.locator("form").getByRole("button", { name: "Login", exact: true }).click();

        await expect(page.getByText(/not verified/)).toBeVisible();
    });

    test("signs out through the confirmation dialog", async ({ page, visit, factories, loginAs }) => {
        const user = await factories.createUser({ username: "Keyboard Fan" });
        await loginAs(user);

        await visit("/");
        await page.getByRole("button", { name: "Logout", exact: true }).click();
        await page.getByRole("alertdialog").getByRole("button", { name: "Logout", exact: true }).click();

        await expect(page.getByRole("button", { name: "Sign Up", exact: true })).toBeVisible();
        await expect(page.getByRole("link", { name: "Keyboard Fan", exact: true })).toHaveCount(0);
    });
});

test.describe("google sign in", () => {
    test("shows the google button on the sign in and sign up pages", async ({ page, visit }) => {
        await visit("/signin");
        await expect(page.getByRole("button", { name: "Continue with Google", exact: true })).toBeVisible();

        await visit("/signup");
        await expect(page.getByRole("button", { name: "Continue with Google", exact: true })).toBeVisible();
    });

    test("shows a readable message for oauth errors", async ({ page, visit }) => {
        await visit("/signin?error=GoogleEmailUnverified");
        await expect(page.getByText("Your Google account email is not verified")).toBeVisible();
    });
});

test.describe("access control", () => {
    test("sends signed out users to the sign in page", async ({ page, visit }) => {
        await visit("/builds/new");
        await expect(page).toHaveURL("/signin");
    });

    test("sends signed in users away from the auth pages", async ({ page, visit, factories, loginAs }) => {
        await loginAs(await factories.createUser());

        await visit("/signin");
        await expect(page.getByText("You are already signed in")).toBeVisible();
        await expect(page).toHaveURL("/");
    });
});
