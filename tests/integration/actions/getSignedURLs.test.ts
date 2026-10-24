import {describe, expect, it} from "vitest";
import {DeleteObjectCommand, HeadObjectCommand} from "@aws-sdk/client-s3";
import {
    confirmAvatarUpload,
    confirmBuildPhotoUpload,
    getSignedAvatarURL,
    getSignedBuildPhotoURL,
} from "@/actions/getSignedURLs";
import {prisma} from "@/lib/prisma";
import {createBuild, createUser} from "../../helpers/factories";
import {signInAs} from "../../helpers/session";
import {s3Mock} from "../../helpers/s3";

const MB = 1024 * 1024;
const CHECKSUM = "a".repeat(64);
const objectURL = (key: string) => `https://${process.env.AWS_BUCKET_URL}/${key}`;

// pretend an object was uploaded to s3 with the metadata the signed url carried (s3 lowercases metadata keys)
const mockUploadedObject = (key: string, metadata: Record<string, string>, contentType = "image/png", size = 1234) =>
    s3Mock.on(HeadObjectCommand, { Key: key }).resolves({ Metadata: metadata, ContentType: contentType, ContentLength: size });

const mockMissingObject = () =>
    s3Mock.on(HeadObjectCommand).rejects(Object.assign(new Error("NotFound"), { name: "NotFound" }));

describe("getSignedAvatarURL", () => {
    it("returns a presigned PUT url and key without creating a photo row", async () => {
        const user = await createUser();
        signInAs(user);

        const result = await getSignedAvatarURL("image/png", MB, CHECKSUM);
        if (!result.success) throw new Error(result.failure);

        expect(result.success.key).toMatch(/^[0-9a-f]{64}$/);
        expect(result.success.url).toContain(result.success.key);
        expect(result.success.url).toContain("X-Amz-Signature");
        expect(await prisma.photo.count()).toBe(0);
    });

    it.each([
        ["application/pdf", MB, "Invalid file type"],
        ["image/png", 2 * MB + 1, "Avatar must be under 2MB"],
    ])("rejects %s of %d bytes", async (type, size, message) => {
        signInAs(await createUser());
        expect(await getSignedAvatarURL(type, size, CHECKSUM)).toEqual({ failure: message });
    });

    it("requires a session", async () => {
        expect(await getSignedAvatarURL("image/png", MB, CHECKSUM)).toEqual({ failure: "User is not authenticated" });
    });
});

describe("confirmAvatarUpload", () => {
    it("creates the avatar photo once the object exists in s3", async () => {
        const user = await createUser();
        signInAs(user);
        mockUploadedObject("newkey", { userid: user.id.toString() }, "image/webp", 4321);

        expect(await confirmAvatarUpload("newkey")).toEqual({ success: {} });
        expect(await prisma.photo.findUniqueOrThrow({ where: { userId: user.id } })).toMatchObject({
            filename: "newkey",
            fileURL: objectURL("newkey"),
            mimetype: "image/webp",
            size: 4321,
        });
    });

    it("fails without creating a row when the upload never happened", async () => {
        signInAs(await createUser());
        mockMissingObject();

        expect(await confirmAvatarUpload("missingkey")).toEqual({ failure: "Upload not found" });
        expect(await prisma.photo.count()).toBe(0);
    });

    it("refuses an object uploaded by another user", async () => {
        const other = await createUser();
        signInAs(await createUser());
        mockUploadedObject("otherkey", { userid: other.id.toString() });

        expect(await confirmAvatarUpload("otherkey")).toEqual({ failure: "Upload not found" });
        expect(await prisma.photo.count()).toBe(0);
    });

    it("replaces the previous avatar and deletes its file", async () => {
        const user = await createUser();
        signInAs(user);
        await prisma.photo.create({ data: { userId: user.id, filename: "oldkey", fileURL: objectURL("oldkey"), mimetype: "image/png", size: 1 } });
        mockUploadedObject("newkey", { userid: user.id.toString() });

        await confirmAvatarUpload("newkey");

        expect((await prisma.photo.findUniqueOrThrow({ where: { userId: user.id } })).filename).toBe("newkey");
        expect(s3Mock.commandCalls(DeleteObjectCommand).map((c) => c.args[0].input.Key)).toEqual(["oldkey"]);
    });

    it("is idempotent when confirmed twice", async () => {
        const user = await createUser();
        signInAs(user);
        mockUploadedObject("newkey", { userid: user.id.toString() });

        await confirmAvatarUpload("newkey");
        expect(await confirmAvatarUpload("newkey")).toEqual({ success: {} });
        expect(await prisma.photo.count()).toBe(1);
        expect(s3Mock.commandCalls(DeleteObjectCommand)).toHaveLength(0);
    });
});

describe("getSignedBuildPhotoURL", () => {
    it("returns a presigned url for the build owner", async () => {
        const owner = await createUser();
        const build = await createBuild(owner.id);
        signInAs(owner);

        const result = await getSignedBuildPhotoURL(build.build_id, true, "image/jpeg", MB, CHECKSUM);
        expect(result.success?.url).toContain("X-Amz-Signature");
        expect(await prisma.photo.count()).toBe(0);
    });

    it("refuses users who don't own the build", async () => {
        const build = await createBuild((await createUser()).id);
        signInAs(await createUser());

        const result = await getSignedBuildPhotoURL(build.build_id, false, "image/jpeg", MB, CHECKSUM);
        expect(result.failure).toContain("does not have the correct permissions");
    });

    it.each([
        ["image/svg+xml", MB, "Invalid file type"],
        ["image/jpeg", 5 * MB + 1, "Photo must be under 5MB"],
    ])("rejects %s of %d bytes", async (type, size, message) => {
        const owner = await createUser();
        const build = await createBuild(owner.id);
        signInAs(owner);

        expect(await getSignedBuildPhotoURL(build.build_id, false, type, size, CHECKSUM)).toEqual({ failure: message });
    });
});

describe("confirmBuildPhotoUpload", () => {
    it("creates the photo with the thumbnail flag from the object metadata", async () => {
        const owner = await createUser();
        const build = await createBuild(owner.id);
        signInAs(owner);
        mockUploadedObject("thumbkey", { userid: owner.id.toString(), buildid: build.build_id, isthumbnail: "true" });

        expect(await confirmBuildPhotoUpload("thumbkey")).toEqual({ success: {} });
        expect(await prisma.photo.findFirstOrThrow({ where: { filename: "thumbkey" } })).toMatchObject({
            buildId: build.build_id,
            isThumbnail: true,
            fileURL: objectURL("thumbkey"),
        });
    });

    it("fails without creating a row when the upload never happened", async () => {
        signInAs(await createUser());
        mockMissingObject();

        expect(await confirmBuildPhotoUpload("missingkey")).toEqual({ failure: "Upload not found" });
        expect(await prisma.photo.count()).toBe(0);
    });

    it("refuses an object uploaded by another user", async () => {
        const owner = await createUser();
        const build = await createBuild(owner.id);
        signInAs(await createUser());
        mockUploadedObject("key", { userid: owner.id.toString(), buildid: build.build_id, isthumbnail: "false" });

        expect(await confirmBuildPhotoUpload("key")).toEqual({ failure: "Upload not found" });
    });

    it("refuses to attach a photo to a build the user no longer owns", async () => {
        const user = await createUser();
        const build = await createBuild((await createUser()).id);
        signInAs(user);
        mockUploadedObject("key", { userid: user.id.toString(), buildid: build.build_id, isthumbnail: "false" });

        expect(await confirmBuildPhotoUpload("key")).toEqual({ failure: "User does not have the correct permissions" });
        expect(await prisma.photo.count()).toBe(0);
    });

    it("is idempotent when confirmed twice", async () => {
        const owner = await createUser();
        const build = await createBuild(owner.id);
        signInAs(owner);
        mockUploadedObject("key", { userid: owner.id.toString(), buildid: build.build_id, isthumbnail: "false" });

        await confirmBuildPhotoUpload("key");
        await confirmBuildPhotoUpload("key");
        expect(await prisma.photo.count()).toBe(1);
    });
});
