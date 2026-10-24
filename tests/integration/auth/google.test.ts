import {describe, expect, it} from "vitest";
import {authOptions} from "@/app/api/auth/[...nextauth]/_authOptions";
import {prisma} from "@/lib/prisma";
import {googleJwt, signInWithGoogle} from "../../helpers/auth";
import {createUser} from "../../helpers/factories";

// account linking rules are documented in AGENTS.md ("Auth")
describe("google sign in (signIn callback)", () => {
    it("rejects a google account whose email is not verified", async () => {
        const { result } = await signInWithGoogle({ email_verified: false });

        expect(result).toBe("/signin?error=GoogleEmailUnverified");
        expect(await prisma.user.count()).toBe(0);
        expect(await prisma.account.count()).toBe(0);
    });

    it("creates a verified user without a password or username for a new email", async () => {
        const { result } = await signInWithGoogle();
        expect(result).toBe(true);

        const user = await prisma.user.findUniqueOrThrow({ where: { email: "person@gmail.com" }, include: { accounts: true } });
        expect(user.verified).toBe(true);
        expect(user.password).toBeNull();
        expect(user.username).toBeNull();
        expect(user.lastLogin).not.toBeNull();
        expect(user.accounts).toMatchObject([{ provider: "google", providerAccountId: "google-sub-1" }]);
    });

    it("signs a returning google user into the same account", async () => {
        await signInWithGoogle();
        await signInWithGoogle();

        expect(await prisma.user.count()).toBe(1);
        expect(await prisma.account.count()).toBe(1);
    });

    it("matches a returning user by google id even if their google email changed", async () => {
        await signInWithGoogle();
        await signInWithGoogle({ email: "renamed@gmail.com" });

        expect(await prisma.user.count()).toBe(1);
    });

    it("links google to a verified password account, keeping its password and username", async () => {
        const existing = await createUser({ email: "person@gmail.com", username: "Existing User", verified: true });

        await signInWithGoogle();

        const user = await prisma.user.findUniqueOrThrow({ where: { id: existing.id }, include: { accounts: true } });
        expect(user.password).toBe(existing.password);
        expect(user.username).toBe("Existing User");
        expect(user.accounts).toHaveLength(1);
        expect(await prisma.user.count()).toBe(1);
    });

    it("matches the existing email ignoring case", async () => {
        const existing = await createUser({ email: "Person@Gmail.com", verified: true });

        await signInWithGoogle();

        expect(await prisma.user.count()).toBe(1);
        expect(await prisma.account.findFirstOrThrow()).toMatchObject({ userId: existing.id });
    });

    it("takes over an unverified password account and clears its password and username", async () => {
        // someone registered the email without proving they own it
        const squatter = await createUser({ email: "person@gmail.com", username: "Squatter Name", verified: false });

        await signInWithGoogle();

        const user = await prisma.user.findUniqueOrThrow({ where: { id: squatter.id }, include: { accounts: true } });
        expect(user.password).toBeNull();
        expect(user.username).toBeNull();
        expect(user.verified).toBe(true);
        expect(user.accounts).toHaveLength(1);
    });
});

describe("google sign in (jwt and session callbacks)", () => {
    it("puts our user id in the token and replaces the google name and picture", async () => {
        const existing = await createUser({ email: "person@gmail.com", username: "Existing User" });

        const token = await googleJwt();

        expect(token.id).toBe(existing.id.toString());
        expect(token.name).toBe("Existing User");
        expect(token).not.toHaveProperty("picture");
    });

    it("leaves the name null for a user who has not chosen a username", async () => {
        const token = await googleJwt();
        expect(token.name).toBeNull();
    });

    it("reloads the username from the database on a session update", async () => {
        const token = await googleJwt();
        await prisma.user.update({ where: { id: Number(token.id) }, data: { username: "Chosen Name" } });

        // the client can't inject a username through update()
        const updated = await authOptions.callbacks!.jwt!({ token, user: undefined as any, account: null, trigger: "update", session: { name: "Injected Name" } });
        expect(updated.name).toBe("Chosen Name");
    });

    it("exposes the id and a null name on the session", async () => {
        const token = await googleJwt();

        const session = await authOptions.callbacks!.session!({
            session: { user: { name: "Google Display Name", email: "person@gmail.com" }, expires: "" },
            token,
        } as any) as any;
        expect(session.user.id).toBe(token.id);
        expect(session.user.name).toBeNull();
    });
});
