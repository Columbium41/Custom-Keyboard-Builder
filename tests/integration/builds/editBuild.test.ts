import {describe, expect, it} from "vitest";
import {PATCH} from "@/app/api/builds/edit/route";
import {prisma} from "@/lib/prisma";
import {jsonRequest, readResponse} from "../../helpers/request";
import {buildPayload, createBuild, createUser} from "../../helpers/factories";
import {signInAs} from "../../helpers/session";

const editBuild = async (body: Record<string, unknown>) =>
    readResponse(await PATCH(jsonRequest("PATCH", "/api/builds/edit", body)));

describe("PATCH /api/builds/edit", () => {
    it("lets the owner edit their build", async () => {
        const owner = await createUser();
        const build = await createBuild(owner.id);
        signInAs(owner);

        const { status } = await editBuild(buildPayload({ build_id: build.build_id, title: "Renamed Build", switches: "Gateron Yellows" }));
        expect(status).toBe(200);
        expect(await prisma.build.findUniqueOrThrow({ where: { build_id: build.build_id } })).toMatchObject({
            title: "Renamed Build",
            switches: "Gateron Yellows",
        });
    });

    it("refuses edits from another user", async () => {
        const build = await createBuild((await createUser()).id);
        signInAs(await createUser());

        const { status, body } = await editBuild(buildPayload({ build_id: build.build_id, title: "Hijacked" }));
        expect(status).toBe(400);
        expect(body.error).toBe("Incorrect Permissions");
        expect((await prisma.build.findUniqueOrThrow({ where: { build_id: build.build_id } })).title).toBe(build.title);
    });

    it("requires a session", async () => {
        const build = await createBuild((await createUser()).id);

        const { status, body } = await editBuild(buildPayload({ build_id: build.build_id }));
        expect(status).toBe(400);
        expect(body.error).toBe("Not authenticated");
    });

    it("rejects an unknown build", async () => {
        signInAs(await createUser());

        const { status, body } = await editBuild(buildPayload({ build_id: "does-not-exist" }));
        expect(status).toBe(400);
        expect(body.error).toBe("Build not found");
    });

    it("applies the same validation as creating a build", async () => {
        const owner = await createUser();
        const build = await createBuild(owner.id);
        signInAs(owner);

        expect((await editBuild(buildPayload({ build_id: build.build_id, title: "" }))).body.error).toBe("Missing required fields");
        expect((await editBuild(buildPayload({ build_id: build.build_id, keycaps: "x".repeat(256) }))).body.error).toBe("Fields are too long");
        expect((await editBuild(buildPayload({ build_id: build.build_id, mods: "x".repeat(1001) }))).body.error).toBe("Mods is too long");
    });
});
