import {describe, expect, it} from "vitest";
import {PATCH} from "@/app/api/users/update_description/route";
import {prisma} from "@/lib/prisma";
import {jsonRequest, readResponse} from "../../helpers/request";
import {createUser} from "../../helpers/factories";
import {signInAs} from "../../helpers/session";

const updateDescription = async (username: string, description: string) =>
    readResponse(await PATCH(jsonRequest("PATCH", "/api/users/update_description", { username, description })));

describe("PATCH /api/users/update_description", () => {
    it("updates the signed in user's description", async () => {
        const user = await createUser();
        signInAs(user);

        const { status } = await updateDescription(user.username!, "I like linear switches");
        expect(status).toBe(200);
        expect((await prisma.user.findUniqueOrThrow({ where: { id: user.id } })).description).toBe("I like linear switches");
    });

    it("refuses to update another user's description", async () => {
        const user = await createUser();
        const other = await createUser();
        signInAs(user);

        const { status } = await updateDescription(other.username!, "hijacked");
        expect(status).toBe(400);
        expect((await prisma.user.findUniqueOrThrow({ where: { id: other.id } })).description).toBeNull();
    });

    it("requires a session", async () => {
        const user = await createUser();

        const { status, body } = await updateDescription(user.username!, "hello");
        expect(status).toBe(400);
        expect(body.error).toBe("Not authenticated");
    });

    it.each([
        ["x".repeat(1001), "Description is too long"],
        ["line\n".repeat(16), "Description has too many lines"],
    ])("rejects an invalid description", async (description, message) => {
        const user = await createUser();
        signInAs(user);

        const { status, body } = await updateDescription(user.username!, description);
        expect(status).toBe(400);
        expect(body.error).toBe(message);
    });
});
