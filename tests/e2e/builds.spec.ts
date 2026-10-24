import {expect, test} from "./fixtures";

const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);

test.describe("explore page", () => {
    test("lists builds newest first and can sort oldest first", async ({ page, visit, factories }) => {
        const author = await factories.createUser({ username: "Build Author" });
        await factories.createBuildWithThumbnail(author.id, { title: "Older Build", createdAt: daysAgo(5) });
        await factories.createBuildWithThumbnail(author.id, { title: "Newer Build", createdAt: daysAgo(1) });

        await visit("/builds");
        const titles = page.locator("p.text-lg");
        await expect(titles).toHaveText(["Newer Build", "Older Build"]);

        await page.locator("select").first().selectOption("oldest");
        await expect(page).toHaveURL(/sort=oldest/);
        await expect(titles).toHaveText(["Older Build", "Newer Build"]);
    });

    test("opens a build from its card", async ({ page, visit, factories, loginAs }) => {
        const author = await factories.createUser();
        const build = await factories.createBuildWithThumbnail(author.id, { title: "Clickable Build" });
        await loginAs(await factories.createUser());

        await visit("/builds");
        await page.getByText("Clickable Build").click();
        await expect(page).toHaveURL(`/builds/${build.build_id}`);
    });
});

test.describe("build page", () => {
    test("shows the specs and author, without owner actions for other users", async ({ page, visit, factories, loginAs }) => {
        const author = await factories.createUser({ username: "Build Author" });
        const build = await factories.createBuildWithThumbnail(author.id, { title: "Showcase Build", switches: "Gateron Oil Kings" });
        await loginAs(await factories.createUser());

        await visit(`/builds/${build.build_id}`);
        await expect(page.getByRole("heading", { name: "Showcase Build" })).toBeVisible();
        await expect(page.getByText("Gateron Oil Kings")).toBeVisible();
        await expect(page.getByRole("link", { name: "Build Author", exact: true })).toBeVisible();
        await expect(page.getByRole("button", { name: "Like", exact: true })).toBeVisible();
        await expect(page.getByRole("button", { name: "Edit", exact: true })).toHaveCount(0);
        await expect(page.getByRole("button", { name: "Delete", exact: true })).toHaveCount(0);
    });

    test("likes and unlikes a build", async ({ page, visit, waitForHydration, db, factories, loginAs }) => {
        const build = await factories.createBuildWithThumbnail((await factories.createUser()).id);
        const fan = await factories.createUser();
        await loginAs(fan);

        // liking reloads the page, wait for it to hydrate again before the next click
        await visit(`/builds/${build.build_id}`);
        await page.getByRole("button", { name: "Like", exact: true }).click();
        await expect(page.getByRole("button", { name: "Unlike", exact: true })).toBeVisible();
        await waitForHydration();
        expect(await db.like.count({ where: { userId: fan.id } })).toBe(1);

        await page.getByRole("button", { name: "Unlike", exact: true }).click();
        await expect(page.getByRole("button", { name: "Like", exact: true })).toBeVisible();
        await waitForHydration();
        expect(await db.like.count()).toBe(0);
    });

    // catches the client router cache showing the old build page after saving
    test("lets the owner edit their build", async ({ page, visit, factories, loginAs }) => {
        const owner = await factories.createUser();
        const build = await factories.createBuildWithThumbnail(owner.id, { title: "Before Edit" });
        await loginAs(owner);

        await visit(`/builds/${build.build_id}`);
        await page.getByRole("button", { name: "Edit", exact: true }).click();
        await expect(page).toHaveURL(`/builds/edit/${build.build_id}`);

        const title = page.locator('input[name="title-input"]');
        await expect(title).toHaveValue("Before Edit");
        await title.fill("After Edit");
        await page.getByRole("button", { name: "Update", exact: true }).click();

        await expect(page).toHaveURL(`/builds/${build.build_id}`);
        await expect(page.getByRole("heading", { name: "After Edit" })).toBeVisible();
    });

    test("lets the owner delete their build", async ({ page, visit, db, factories, loginAs }) => {
        const owner = await factories.createUser();
        // no photos, deleting photos calls s3 which isn't available in e2e (covered by the vitest delete tests)
        const build = await factories.createBuild(owner.id);
        await loginAs(owner);

        await visit(`/builds/${build.build_id}`);
        await page.getByRole("button", { name: "Delete", exact: true }).click();
        await page.getByRole("alertdialog").getByRole("button", { name: "Delete", exact: true }).click();

        await expect(page).toHaveURL("/");
        expect(await db.build.count()).toBe(0);
    });
});

test.describe("creating a build", () => {
    // uploads go straight from the browser to s3, which isn't available in tests.
    // this covers the failure path: the half-created build is removed so the user can retry
    test("removes the build if the photo upload fails", async ({ page, visit, db, factories, loginAs }) => {
        await loginAs(await factories.createUser());
        await page.route("https://test-bucket.s3.us-east-1.amazonaws.com/**", (route) => route.fulfill({ status: 500 }));

        await visit("/builds/new");
        await page.locator('input[name="title-input"]').fill("Doomed Build");
        await page.locator('input[name="thumbnail-input"]').setInputFiles({ name: "thumb.png", mimeType: "image/png", buffer: Buffer.from("fake image") });
        await page.locator('input[name="case-input"]').fill("Singa Kohaku R1");
        await page.locator('input[name="plate-input"]').fill("Aluminum");
        await page.locator('input[name="switches-input"]').fill("Cherry MX Browns");
        await page.locator('input[name="keycaps-input"]').fill("GMK Striker");
        await page.getByRole("button", { name: "Create", exact: true }).click();

        await expect(page.getByText("Error when uploading photos, please try again later")).toBeVisible();
        await expect(page).toHaveURL("/builds/new");
        expect(await db.build.count()).toBe(0);
    });

    test("shows server validation errors", async ({ page, visit, db, factories, loginAs }) => {
        await loginAs(await factories.createUser());

        await visit("/builds/new");
        await page.locator('input[name="title-input"]').fill("Bad Link Build");
        await page.locator('input[name="thumbnail-input"]').setInputFiles({ name: "thumb.png", mimeType: "image/png", buffer: Buffer.from("fake image") });
        await page.locator('input[name="case-input"]').fill("Singa Kohaku R1");
        await page.locator('input[name="plate-input"]').fill("Aluminum");
        await page.locator('input[name="switches-input"]').fill("Cherry MX Browns");
        await page.locator('input[name="keycaps-input"]').fill("GMK Striker");
        await page.locator('input[name="youtube-link-input"]').fill("https://example.com/not-youtube");
        await page.getByRole("button", { name: "Create", exact: true }).click();

        await expect(page.getByText("Invalid YouTube Link")).toBeVisible();
        await expect(page.getByRole("button", { name: "Create", exact: true })).toBeEnabled();
        expect(await db.build.count()).toBe(0);
    });
});
