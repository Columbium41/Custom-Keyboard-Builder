import {describe, expect, it} from "vitest";
import {POST} from "@/app/api/users/complete_profile/route";
import {prisma} from "@/lib/prisma";
import {jsonRequest, readResponse} from "../../helpers/request";
import {createUser} from "../../helpers/factories";
import {signInAs} from "../../helpers/session";

const completeProfile = async (username: unknown) =>
    readResponse(await POST(jsonRequest("POST", "/api/users/complete_profile", { username })));

const createOnboardingUser = () => createUser({ username: null, plainPassword: null });

describe("POST /api/users/complete_profile", () => {
    it("sets the username for a user who doesn't have one", async () => {
        const user = await createOnboardingUser();
        signInAs(user);

        const { status } = await completeProfile("Chosen Name");
        expect(status).toBe(200);
        expect((await prisma.user.findUniqueOrThrow({ where: { id: user.id } })).username).toBe("Chosen Name");
    });

    it("requires a session", async () => {
        const { status, body } = await completeProfile("Chosen Name");
        expect(status).toBe(400);
        expect(body.error).toBe("Not authenticated");
    });

    it.each([
        [undefined, "Username not given"],
        [12345678, "Username not given"],
        ["short", "between 6-30 characters"],
        ["bad_chars", "alphanumerical characters and spaces"],
    ])("rejects invalid username %j", async (username, message) => {
        const user = await createOnboardingUser();
        signInAs(user);

        const { status, body } = await completeProfile(username);
        expect(status).toBe(400);
        expect(body.error).toContain(message);
    });

    it("cannot be used to rename an account that already has a username", async () => {
        const user = await createUser({ username: "Original Name" });
        signInAs(user);

        const { status, body } = await completeProfile("Renamed User");
        expect(status).toBe(400);
        expect(body.error).toBe("Username has already been set");
        expect((await prisma.user.findUniqueOrThrow({ where: { id: user.id } })).username).toBe("Original Name");
    });

    it("rejects a username that is already taken", async () => {
        await createUser({ username: "Taken Name" });
        const user = await createOnboardingUser();
        signInAs(user);

        const { status, body } = await completeProfile("Taken Name");
        expect(status).toBe(400);
        expect(body.error).toBe("Username already in use");
    });
});
