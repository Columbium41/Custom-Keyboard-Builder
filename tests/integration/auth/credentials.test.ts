import {describe, expect, it} from "vitest";
import {authOptions} from "@/app/api/auth/[...nextauth]/_authOptions";
import {prisma} from "@/lib/prisma";
import {authorizeCredentials} from "../../helpers/auth";
import {createUser, DEFAULT_PASSWORD} from "../../helpers/factories";

describe("credentials sign in (authorize)", () => {
    it("signs in by email", async () => {
        const user = await createUser({ email: "member@example.com", username: "Member One" });

        const result = await authorizeCredentials("member@example.com", DEFAULT_PASSWORD);
        expect(result).toMatchObject({ id: user.id.toString(), email: "member@example.com", name: "Member One" });
    });

    it("signs in by username", async () => {
        const user = await createUser({ username: "Member One" });

        const result = await authorizeCredentials("Member One", DEFAULT_PASSWORD);
        expect(result).toMatchObject({ id: user.id.toString(), name: "Member One" });
    });

    it.each([
        ["a wrong password", async () => { const u = await createUser(); return [u.email, "wrongpassword"]; }],
        ["an unknown user", async () => ["nobody@example.com", DEFAULT_PASSWORD]],
        ["missing credentials", async () => ["", ""]],
    ])("rejects %s with a generic error", async (_, setup) => {
        const [login, password] = await setup();

        const result = await authorizeCredentials(login, password);
        expect(result).toEqual({ error: "Sign In failed, please check your credentials." });
    });

    it("rejects an unverified account", async () => {
        const user = await createUser({ verified: false });

        const result = await authorizeCredentials(user.email, DEFAULT_PASSWORD);
        expect(result.error).toContain("not verified");
    });

    it("rejects a google-only account instead of crashing on the null password", async () => {
        const user = await createUser({ plainPassword: null });

        const result = await authorizeCredentials(user.email, DEFAULT_PASSWORD);
        expect(result.error).toContain("uses Google sign-in");
    });
});

describe("credentials sign in (signIn callback)", () => {
    const signIn = authOptions.callbacks!.signIn!;

    it("surfaces the error returned by authorize", async () => {
        await expect(signIn({ user: { error: "Some error" } as any, account: null })).rejects.toThrow("Some error");
    });

    it("updates lastLogin", async () => {
        const user = await createUser();
        expect(user.lastLogin).toBeNull();

        await expect(signIn({ user: { id: user.id.toString() } as any, account: { provider: "credentials", type: "credentials", providerAccountId: user.id.toString() } })).resolves.toBe(true);
        expect((await prisma.user.findUniqueOrThrow({ where: { id: user.id } })).lastLogin).not.toBeNull();
    });
});
