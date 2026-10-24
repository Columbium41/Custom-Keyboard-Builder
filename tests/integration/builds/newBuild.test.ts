import {describe, expect, it, vi} from "vitest";
import axios from "axios";
import {POST} from "@/app/api/builds/new/route";
import {prisma} from "@/lib/prisma";
import {jsonRequest, readResponse} from "../../helpers/request";
import {buildPayload, createUser} from "../../helpers/factories";
import {signInAs} from "../../helpers/session";

const createBuild = async (body: Record<string, unknown>) =>
    readResponse(await POST(jsonRequest("POST", "/api/builds/new", body)));

// the youtube data api returns one item for an existing video, none otherwise
const mockYouTube = (exists: boolean) =>
    vi.mocked(axios.get).mockResolvedValue({ data: { items: exists ? [{ id: "dQw4w9WgXcQ" }] : [] } });

describe("POST /api/builds/new", () => {
    it("creates a build owned by the signed in user", async () => {
        const user = await createUser();
        signInAs(user);

        const { status, body } = await createBuild(buildPayload());
        expect(status).toBe(200);

        const build = await prisma.build.findUniqueOrThrow({ where: { build_id: body.buildId } });
        expect(build).toMatchObject({
            userId: user.id,
            title: "My Build",
            case: "Singa Kohaku R1",
            stabilizers: "Durock V2",
            // no link is stored as "" rather than null, the build page treats both as "no video"
            youtubeLink: "",
        });
    });

    it("requires a session", async () => {
        const { status, body } = await createBuild(buildPayload());
        expect(status).toBe(400);
        expect(body.error).toBe("Not authenticated");
        expect(await prisma.build.count()).toBe(0);
    });

    it.each(["title", "caseValue", "plate", "switches", "keycaps"])("requires %s", async (field) => {
        signInAs(await createUser());

        const { status, body } = await createBuild(buildPayload({ [field]: "" }));
        expect(status).toBe(400);
        expect(body.error).toBe("Missing required fields");
    });

    it.each(["title", "caseValue", "pcb", "plate", "switches", "keycaps", "stabs"])("limits %s to 255 characters", async (field) => {
        signInAs(await createUser());

        const { status, body } = await createBuild(buildPayload({ [field]: "x".repeat(256) }));
        expect(status).toBe(400);
        expect(body.error).toBe("Fields are too long");
    });

    it.each([
        ["x".repeat(1001), "Mods is too long"],
        ["mod\n".repeat(16), "Mods has too many lines"],
    ])("limits mods", async (mods, message) => {
        signInAs(await createUser());

        const { status, body } = await createBuild(buildPayload({ mods }));
        expect(status).toBe(400);
        expect(body.error).toBe(message);
    });

    it.each([
        "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "https://youtu.be/dQw4w9WgXcQ",
        "https://www.youtube.com/embed/dQw4w9WgXcQ",
    ])("stores only the video id for youtube link %s", async (youtube_link) => {
        signInAs(await createUser());
        mockYouTube(true);

        const { status, body } = await createBuild(buildPayload({ youtube_link }));
        expect(status).toBe(200);
        expect((await prisma.build.findUniqueOrThrow({ where: { build_id: body.buildId } })).youtubeLink).toBe("dQw4w9WgXcQ");
    });

    it("rejects a youtube video that doesn't exist", async () => {
        signInAs(await createUser());
        mockYouTube(false);

        const { status, body } = await createBuild(buildPayload({ youtube_link: "https://youtu.be/dQw4w9WgXcQ" }));
        expect(status).toBe(400);
        expect(body.error).toBe("Invalid YouTube Link");
    });

    it("rejects a link that isn't a youtube url", async () => {
        signInAs(await createUser());

        const { status, body } = await createBuild(buildPayload({ youtube_link: "https://example.com/video" }));
        expect(status).toBe(400);
        expect(body.error).toBe("Invalid YouTube Link");
        expect(axios.get).not.toHaveBeenCalled();
    });
});
