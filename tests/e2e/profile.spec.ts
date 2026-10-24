import {expect, test} from "./fixtures";

test.describe("profile page", () => {
    test("lets the owner edit their description", async ({ page, visit, factories, loginAs }) => {
        const user = await factories.createUser({ username: "Profile Owner" });
        await loginAs(user);

        await visit(`/users/${encodeURIComponent("Profile Owner")}`);
        await expect(page.getByText("This user hasn't entered a profile description")).toBeVisible();

        await page.getByRole("button", { name: "Edit Description", exact: true }).click();
        await page.getByPlaceholder("enter a description").fill("Collector of tactile switches");
        // wait for the save, otherwise the test can end and abort the request mid-flight
        const response = page.waitForResponse("**/api/users/update_description");
        await page.getByRole("button", { name: "Save", exact: true }).click();
        expect((await response).ok()).toBe(true);

        // the page reloads after saving, so the textarea is gone and the saved text is shown
        await expect(page.getByPlaceholder("enter a description")).toHaveCount(0);
        await expect(page.getByText("Collector of tactile switches")).toBeVisible();
    });

    test("hides owner controls on someone else's profile", async ({ page, visit, factories, loginAs }) => {
        await factories.createUser({ username: "Someone Else" });
        await loginAs(await factories.createUser());

        await visit(`/users/${encodeURIComponent("Someone Else")}`);
        await expect(page.getByText("Someone Else", { exact: true })).toBeVisible();
        await expect(page.getByRole("button", { name: "Edit Description", exact: true })).toHaveCount(0);
        await expect(page.getByText("Change Avatar")).toHaveCount(0);
        await expect(page.getByRole("tab", { name: "Liked Builds", exact: true })).toHaveCount(0);
    });

    test("lists the user's builds in the builds tab", async ({ page, visit, factories, loginAs }) => {
        const user = await factories.createUser({ username: "Prolific Builder" });
        await factories.createBuildWithThumbnail(user.id, { title: "First Board" });
        await factories.createBuildWithThumbnail(user.id, { title: "Second Board" });
        await loginAs(user);

        await visit(`/users/${encodeURIComponent("Prolific Builder")}`);
        await page.getByRole("tab", { name: "Builds", exact: true }).click();

        await expect(page.getByText("First Board")).toBeVisible();
        await expect(page.getByText("Second Board")).toBeVisible();
    });
});
