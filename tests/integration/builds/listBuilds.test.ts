import {describe, expect, it} from "vitest";
import {GET} from "@/app/api/builds/pages/route";
import {prisma} from "@/lib/prisma";
import {jsonRequest, readResponse} from "../../helpers/request";
import {createBuild, createUser} from "../../helpers/factories";

const listBuilds = async (query: string) =>
    readResponse(await GET(jsonRequest("GET", `/api/builds/pages?${query}`)));

const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);

describe("GET /api/builds/pages", () => {
    it("paginates and reports the total", async () => {
        const user = await createUser();
        for (let i = 0; i < 5; i++) {
            await createBuild(user.id, { createdAt: daysAgo(i) });
        }

        const page1 = await listBuilds("page=1&limit=2");
        const page3 = await listBuilds("page=3&limit=2");

        expect(page1.body.total).toBe(5);
        expect(page1.body.items).toHaveLength(2);
        expect(page3.body.items).toHaveLength(1);
    });

    it("includes the author's username but no private user fields", async () => {
        const user = await createUser({ username: "Author Name" });
        await createBuild(user.id);

        const { body } = await listBuilds("");
        expect(body.items[0].user).toEqual({ username: "Author Name", avatar: null });
    });

    it("sorts newest first by default, or oldest first", async () => {
        const user = await createUser();
        const older = await createBuild(user.id, { createdAt: daysAgo(3) });
        const newer = await createBuild(user.id, { createdAt: daysAgo(1) });

        expect((await listBuilds("")).body.items.map((b: any) => b.build_id)).toEqual([newer.build_id, older.build_id]);
        expect((await listBuilds("sort=oldest")).body.items.map((b: any) => b.build_id)).toEqual([older.build_id, newer.build_id]);
    });

    it("sorts by most likes", async () => {
        const author = await createUser();
        const fans = [await createUser(), await createUser()];
        const unpopular = await createBuild(author.id, { createdAt: daysAgo(1) });
        const popular = await createBuild(author.id, { createdAt: daysAgo(2) });
        for (const fan of fans) {
            await prisma.like.create({ data: { userId: fan.id, buildId: popular.build_id } });
        }

        const { body } = await listBuilds("sort=most_likes");
        expect(body.items.map((b: any) => b.build_id)).toEqual([popular.build_id, unpopular.build_id]);
    });

    it.each([
        ["past_week", 2],
        ["past_month", 3],
        ["past_year", 4],
        ["all_time", 5],
    ])("filters by timeframe %s", async (timeframe, expected) => {
        const user = await createUser();
        for (const days of [1, 5, 20, 200, 500]) {
            await createBuild(user.id, { createdAt: daysAgo(days) });
        }

        const { body } = await listBuilds(`timeframe=${timeframe}`);
        expect(body.total).toBe(expected);
    });
});
