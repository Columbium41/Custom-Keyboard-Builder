import {describe, expect, it, vi} from "vitest";
import {DeleteObjectCommand} from "@aws-sdk/client-s3";
import {DELETE} from "@/app/api/users/delete_account/route";
import {prisma} from "@/lib/prisma";
import {jsonRequest, readResponse} from "../../helpers/request";
import {createBuild, createBuildPhoto, createUser} from "../../helpers/factories";
import {signInAs} from "../../helpers/session";
import {s3Mock} from "../../helpers/s3";

const deleteAccount = async (username: unknown) =>
    readResponse(await DELETE(jsonRequest("DELETE", "/api/users/delete_account", { username })));

const createAvatar = (userId: number) =>
    prisma.photo.create({
        data: { userId, filename: "avatar", fileURL: `https://${process.env.AWS_BUCKET_URL}/avatar`, mimetype: "image/png", size: 1 },
    });

const deletedKeys = () => s3Mock.commandCalls(DeleteObjectCommand).map((call) => call.args[0].input.Key).sort();

describe("DELETE /api/users/delete_account", () => {
    it("deletes the user and everything they own, including s3 files", async () => {
        const user = await createUser();
        await createAvatar(user.id);
        const build = await createBuild(user.id);
        const photo = await createBuildPhoto(build.build_id, { isThumbnail: true });
        await prisma.account.create({ data: { userId: user.id, provider: "google", providerAccountId: "google-123" } });
        await prisma.comment.create({ data: { userId: user.id, buildId: build.build_id, contents: "nice" } });
        // their like on someone else's build goes too
        const otherBuild = await createBuild((await createUser()).id);
        await prisma.like.create({ data: { userId: user.id, buildId: otherBuild.build_id } });
        signInAs(user);

        const { status, body } = await deleteAccount(user.username);
        expect(status).toBe(200);
        expect(body.message).toBe("Account deleted");

        expect(await prisma.user.findUnique({ where: { id: user.id } })).toBeNull();
        expect(await prisma.build.count({ where: { userId: user.id } })).toBe(0);
        expect(await prisma.photo.count()).toBe(0);
        expect(await prisma.like.count()).toBe(0);
        expect(await prisma.comment.count()).toBe(0);
        expect(await prisma.account.count()).toBe(0);
        expect(deletedKeys()).toEqual(["avatar", photo.filename].sort());
    });

    it("leaves other users and their files alone", async () => {
        const user = await createUser();
        const other = await createUser();
        const otherBuild = await createBuild(other.id);
        await createBuildPhoto(otherBuild.build_id, { isThumbnail: true });
        // a like from the deleted user's side shouldn't take the other build with it
        await prisma.like.create({ data: { userId: user.id, buildId: otherBuild.build_id } });
        signInAs(user);

        expect((await deleteAccount(user.username)).status).toBe(200);
        expect(await prisma.user.findUnique({ where: { id: other.id } })).not.toBeNull();
        expect(await prisma.build.count()).toBe(1);
        expect(await prisma.photo.count()).toBe(1);
        expect(deletedKeys()).toEqual([]);
    });

    it("still deletes the account when s3 fails", async () => {
        const user = await createUser();
        await createAvatar(user.id);
        s3Mock.on(DeleteObjectCommand).rejects(new Error("s3 is down"));
        const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
        signInAs(user);

        expect((await deleteAccount(user.username)).status).toBe(200);
        expect(await prisma.user.count()).toBe(0);
        expect(consoleError).toHaveBeenCalledTimes(1);
        consoleError.mockRestore();
    });

    it("requires the username to be typed as confirmation", async () => {
        const user = await createUser();
        signInAs(user);

        for (const username of [undefined, "", "Someone Else", user.username!.toLowerCase()]) {
            const { status, body } = await deleteAccount(username);
            expect(status).toBe(400);
            expect(body.error).toBe("Username does not match");
        }
        expect(await prisma.user.count()).toBe(1);
    });

    it("can't delete someone else's account", async () => {
        const user = await createUser();
        const other = await createUser();
        signInAs(user);

        expect((await deleteAccount(other.username)).status).toBe(400);
        expect(await prisma.user.count()).toBe(2);
    });

    it("requires a session", async () => {
        const user = await createUser();

        const { status, body } = await deleteAccount(user.username);
        expect(status).toBe(400);
        expect(body.error).toBe("Not authenticated");
        expect(await prisma.user.count()).toBe(1);
    });
});
