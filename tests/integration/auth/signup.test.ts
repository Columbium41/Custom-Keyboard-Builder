import {describe, expect, it, vi} from "vitest";
import {compare} from "bcrypt";
import jwt from "jsonwebtoken";
import {POST} from "@/app/api/auth/signup/route";
import {prisma} from "@/lib/prisma";
import {sendEmailVerification} from "@/mailer/emailVerification";
import {jsonRequest, readResponse} from "../../helpers/request";
import {createUser} from "../../helpers/factories";

const signup = async (body: Record<string, unknown>) =>
    readResponse(await POST(jsonRequest("POST", "/api/auth/signup", body)));

const validBody = {
    username: "New Member",
    email: "new@example.com",
    password: "password123",
    passwordConfirmation: "password123",
    captchaToken: "captcha-token",
};

describe("POST /api/auth/signup", () => {
    it("creates an unverified user with a hashed password", async () => {
        const { status } = await signup(validBody);
        expect(status).toBe(200);

        const user = await prisma.user.findUniqueOrThrow({ where: { email: "new@example.com" } });
        expect(user.username).toBe("New Member");
        expect(user.verified).toBe(false);
        expect(user.password).not.toBe("password123");
        expect(await compare("password123", user.password!)).toBe(true);
    });

    it("emails a verification token for the new user", async () => {
        await signup(validBody);
        const user = await prisma.user.findUniqueOrThrow({ where: { email: "new@example.com" } });

        expect(sendEmailVerification).toHaveBeenCalledTimes(1);
        const [email, token] = vi.mocked(sendEmailVerification).mock.calls[0];
        expect(email).toBe("new@example.com");
        expect(jwt.verify(token, process.env.EMAIL_SECRET!)).toMatchObject({ userId: user.id });
    });

    it("rejects missing fields", async () => {
        const { status, body } = await signup({ ...validBody, email: "" });
        expect(status).toBe(400);
        expect(body.error).toBe("Missing fields");
    });

    it.each([
        [{ username: "short" }, "Username must be between 6-30 characters"],
        [{ username: "has_underscore" }, "alphanumerical characters and spaces"],
        [{ password: "short", passwordConfirmation: "short" }, "Password must be between 8-40 characters"],
        [{ passwordConfirmation: "different123" }, "Passwords do not match"],
    ])("rejects invalid input %j", async (overrides, message) => {
        const { status, body } = await signup({ ...validBody, ...overrides });
        expect(status).toBe(400);
        expect(body.error).toContain(message);
        expect(await prisma.user.count()).toBe(0);
    });

    it("rejects a username that is already taken", async () => {
        await createUser({ username: "New Member" });

        const { status, body } = await signup(validBody);
        expect(status).toBe(400);
        expect(body.error).toBe("Username or email already in use");
    });

    it("rejects an email that is already taken, ignoring case", async () => {
        await createUser({ email: "new@example.com" });

        const { status, body } = await signup({ ...validBody, email: "NEW@example.com" });
        expect(status).toBe(400);
        expect(body.error).toBe("Username or email already in use");
    });
});
