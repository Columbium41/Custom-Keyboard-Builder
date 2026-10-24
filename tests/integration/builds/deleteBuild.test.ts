import {describe, expect, it} from "vitest";
import {DeleteObjectCommand} from "@aws-sdk/client-s3";
import {DELETE} from "@/app/api/builds/delete/route";
import {prisma} from "@/lib/prisma";
import {jsonRequest, readResponse} from "../../helpers/request";
import {createBuild, createBuildPhoto, createUser} from "../../helpers/factories";
import {signInAs} from "../../helpers/session";
import {s3Mock} from "../../helpers/s3";

const deleteBuild = async (buildId: unknown) =>
    readResponse(await DELETE(jsonRequest("DELETE", "/api/builds/delete", { buildId })));

describe("DELETE /api/builds/delete", () => {
    it("deletes the build, its photos, likes, and the photo files in s3", async () => {
        const owner = await createUser();
        const liker = await createUser();
        const build = await createBuild(owner.id);
        const thumbnail = await createBuildPhoto(build.build_id, { isThumbnail: true });
        const photo = await createBuildPhoto(build.build_id);
        await prisma.like.create({ data: { userId: liker.id, buildId: build.build_id } });
        signInAs(owner);

        const { status } = await deleteBuild(build.build_id);
        expect(status).toBe(200);

        expect(await prisma.build.count()).toBe(0);
        expect(await prisma.photo.count()).toBe(0);
        expect(await prisma.like.count()).toBe(0);

        const deletedKeys = s3Mock.commandCalls(DeleteObjectCommand).map((call) => call.args[0].input.Key);
        expect(deletedKeys.sort()).toEqual([thumbnail.filename, photo.filename].sort());
    });

    it("refuses to delete another user's build", async () => {
        const build = await createBuild((await createUser()).id);
        await createBuildPhoto(build.build_id);
        signInAs(await createUser());

        const { status, body } = await deleteBuild(build.build_id);
        expect(status).toBe(400);
        expect(body.error).toBe("Incorrect Permissions");
        expect(await prisma.build.count()).toBe(1);
        expect(s3Mock.commandCalls(DeleteObjectCommand)).toHaveLength(0);
    });

    it("requires a session", async () => {
        const build = await createBuild((await createUser()).id);

        const { status, body } = await deleteBuild(build.build_id);
        expect(status).toBe(400);
        expect(body.error).toBe("Not authenticated");
        expect(await prisma.build.count()).toBe(1);
    });

    it("rejects a missing or unknown build id", async () => {
        signInAs(await createUser());

        expect((await deleteBuild(undefined)).body.error).toBe("build id not found");
        expect((await deleteBuild("does-not-exist")).body.error).toBe("Build not found");
    });
});
