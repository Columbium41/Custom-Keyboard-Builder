import {describe, expect, it} from "vitest";
import {POST as like} from "@/app/api/builds/like/route";
import {GET as getUserLikes} from "@/app/api/likes/get_user_likes/route";
import {prisma} from "@/lib/prisma";
import {jsonRequest, readResponse} from "../../helpers/request";
import {createBuild, createUser} from "../../helpers/factories";
import {signInAs} from "../../helpers/session";

const toggleLike = async (buildId: unknown) =>
    readResponse(await like(jsonRequest("POST", "/api/builds/like", { buildId })));

describe("POST /api/builds/like", () => {
    it("likes a build, and unlikes it on the second call", async () => {
        const user = await createUser();
        const build = await createBuild((await createUser()).id);
        signInAs(user);

        expect((await toggleLike(build.build_id)).body.message).toBe("Successfully liked build");
        expect(await prisma.like.count({ where: { userId: user.id, buildId: build.build_id } })).toBe(1);

        expect((await toggleLike(build.build_id)).body.message).toBe("Unliked build");
        expect(await prisma.like.count()).toBe(0);
    });

    it("requires a session", async () => {
        const build = await createBuild((await createUser()).id);

        const { status, body } = await toggleLike(build.build_id);
        expect(status).toBe(400);
        expect(body.error).toBe("Not authenticated");
    });

    it("rejects a missing or unknown build", async () => {
        signInAs(await createUser());

        expect((await toggleLike(undefined)).body.error).toBe("Build Id not present");
        expect((await toggleLike("does-not-exist")).body.error).toBe("Build not found");
    });
});

describe("GET /api/likes/get_user_likes", () => {
    it("returns only the signed in user's likes", async () => {
        const user = await createUser();
        const other = await createUser();
        const build = await createBuild(other.id);
        const otherBuild = await createBuild(other.id);
        await prisma.like.create({ data: { userId: user.id, buildId: build.build_id } });
        await prisma.like.create({ data: { userId: other.id, buildId: otherBuild.build_id } });
        signInAs(user);

        const { status, body } = await readResponse(await getUserLikes(jsonRequest("GET", "/api/likes/get_user_likes")));
        expect(status).toBe(200);
        expect(body.likes).toEqual([{ userId: user.id, buildId: build.build_id }]);
    });

    it("requires a session", async () => {
        const { status } = await readResponse(await getUserLikes(jsonRequest("GET", "/api/likes/get_user_likes")));
        expect(status).toBe(400);
    });
});
