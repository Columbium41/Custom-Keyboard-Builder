import {describe, expect, it} from "vitest";
import {getBuildData} from "@/lib/build";
import {getUserData} from "@/lib/user";
import {getUserLikedBuilds} from "@/lib/like";
import {prisma} from "@/lib/prisma";
import {createBuild, createBuildPhoto, createUser} from "../../helpers/factories";

const PRIVATE_USER_FIELDS = ["email", "password", "verified", "lastLogin"];

// these results are passed to client components, so anything selected ends up in the page html
const expectNoPrivateUserFields = (user: object) => {
    for (const field of PRIVATE_USER_FIELDS) {
        expect(user).not.toHaveProperty(field);
    }
};

const createAvatar = (userId: number) =>
    prisma.photo.create({
        data: { userId, filename: "avatar", fileURL: `https://${process.env.AWS_BUCKET_URL}/avatar`, mimetype: "image/png", size: 1 },
    });

describe("getBuildData", () => {
    it("returns the build with its photos, likes, and author", async () => {
        const owner = await createUser({ username: "Build Owner" });
        const avatar = await createAvatar(owner.id);
        const build = await createBuild(owner.id, { title: "Tofu65", youtubeLink: "dQw4w9WgXcQ" });
        const thumbnail = await createBuildPhoto(build.build_id, { isThumbnail: true });
        await prisma.like.create({ data: { userId: (await createUser()).id, buildId: build.build_id } });

        const result = await getBuildData(build.build_id);
        expect(result).toMatchObject({
            build_id: build.build_id,
            title: "Tofu65",
            youtubeLink: "dQw4w9WgXcQ",
            photos: [expect.objectContaining({ photo_id: thumbnail.photo_id, isThumbnail: true })],
            likes: [expect.objectContaining({ buildId: build.build_id })],
            user: { username: "Build Owner", avatar: expect.objectContaining({ photo_id: avatar.photo_id }) },
        });
        expect(Object.keys(result!.user)).toEqual(["username", "avatar"]);
    });

    it("returns null for an unknown build", async () => {
        expect(await getBuildData("does-not-exist")).toBeNull();
    });
});

describe("getUserData", () => {
    it("returns the profile with builds and likes", async () => {
        const user = await createUser({ username: "Profile Owner", description: "hello" });
        const build = await createBuild(user.id);
        await createBuildPhoto(build.build_id, { isThumbnail: true });
        const otherBuild = await createBuild((await createUser()).id);
        await prisma.like.create({ data: { userId: user.id, buildId: otherBuild.build_id } });

        const result = await getUserData("Profile Owner");
        expect(result).toMatchObject({
            id: user.id,
            username: "Profile Owner",
            description: "hello",
            avatar: null,
            builds: [expect.objectContaining({ build_id: build.build_id, photos: [expect.anything()] })],
            likes: [expect.objectContaining({ buildId: otherBuild.build_id })],
        });
    });

    it("doesn't expose private fields, including on nested build authors", async () => {
        const user = await createUser({ username: "Private Person", lastLogin: new Date() });
        await createBuild(user.id);

        const result = await getUserData("Private Person");
        expectNoPrivateUserFields(result!);
        expectNoPrivateUserFields(result!.builds[0].user);
    });

    it("returns null for an unknown username", async () => {
        expect(await getUserData("Nobody Here")).toBeNull();
    });

    it("matches the username exactly", async () => {
        await createUser({ username: "Case Sensitive" });
        expect(await getUserData("case sensitive")).toBeNull();
    });
});

describe("getUserLikedBuilds", () => {
    it("returns only the builds the user liked", async () => {
        const user = await createUser();
        const author = await createUser({ username: "Build Author" });
        const liked = await createBuild(author.id);
        await createBuild(author.id);
        await prisma.like.create({ data: { userId: user.id, buildId: liked.build_id } });
        // someone else's like shouldn't show up
        const other = await createUser();
        const otherLiked = await createBuild(author.id);
        await prisma.like.create({ data: { userId: other.id, buildId: otherLiked.build_id } });

        const result = await getUserLikedBuilds(user.id);
        expect(result).toHaveLength(1);
        expect(result[0].build).toMatchObject({ build_id: liked.build_id, user: { username: "Build Author" } });
        expectNoPrivateUserFields(result[0].build.user);
    });

    it("returns an empty list for a user with no likes", async () => {
        expect(await getUserLikedBuilds((await createUser()).id)).toEqual([]);
    });
});
