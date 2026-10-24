import {describe, expect, it} from "vitest";
import jwt from "jsonwebtoken";
import {POST as verifyEmail} from "@/app/api/auth/verify_email/route";
import {POST as sendVerification} from "@/app/api/auth/send_email_verification/route";
import {prisma} from "@/lib/prisma";
import {sendEmailVerification} from "@/mailer/emailVerification";
import {jsonRequest, readResponse} from "../../helpers/request";
import {createUser} from "../../helpers/factories";

const tokenFor = (userId: number, options: jwt.SignOptions = { expiresIn: "24h" }, secret = process.env.EMAIL_SECRET!) =>
    jwt.sign({ userId }, secret, options);

const verify = async (token: unknown) =>
    readResponse(await verifyEmail(jsonRequest("POST", "/api/auth/verify_email", { token })));

describe("POST /api/auth/verify_email", () => {
    it("verifies the account for a valid token", async () => {
        const user = await createUser({ verified: false });

        const { status, body } = await verify(tokenFor(user.id));
        expect(status).toBe(200);
        expect(body.message).toBe("Successfully verified account");
        expect((await prisma.user.findUniqueOrThrow({ where: { id: user.id } })).verified).toBe(true);
    });

    it("reports an already verified account", async () => {
        const user = await createUser({ verified: true });

        const { status, body } = await verify(tokenFor(user.id));
        expect(status).toBe(200);
        expect(body.message).toBe("User is already verified");
    });

    it.each([
        ["missing", () => undefined],
        ["garbage", () => "not-a-jwt"],
        ["signed with the wrong secret", (id: number) => tokenFor(id, { expiresIn: "24h" }, "wrong-secret")],
        ["expired", (id: number) => tokenFor(id, { expiresIn: -10 })],
        ["for a deleted user", () => tokenFor(999999)],
    ])("rejects a %s token", async (_, makeToken) => {
        const user = await createUser({ verified: false });

        const { status, body } = await verify(makeToken(user.id));
        expect(status).toBe(400);
        expect(body.error).toBe("Invalid or expired token");
        expect((await prisma.user.findUniqueOrThrow({ where: { id: user.id } })).verified).toBe(false);
    });
});

describe("POST /api/auth/send_email_verification", () => {
    const resend = async (email: string) =>
        readResponse(await sendVerification(jsonRequest("POST", "/api/auth/send_email_verification", { email, captchaToken: "captcha-token" })));

    it("re-sends a verification email to an unverified user", async () => {
        const user = await createUser({ verified: false });

        const { status } = await resend(user.email);
        expect(status).toBe(200);
        expect(sendEmailVerification).toHaveBeenCalledWith(user.email, expect.any(String));
    });

    it("does not send an email to a verified user", async () => {
        const user = await createUser({ verified: true });

        const { status, body } = await resend(user.email);
        expect(status).toBe(200);
        expect(body.message).toBe("Email already verified");
        expect(sendEmailVerification).not.toHaveBeenCalled();
    });

    it("rejects an unknown email", async () => {
        const { status, body } = await resend("nobody@example.com");
        expect(status).toBe(400);
        expect(body.error).toBe("Invalid email");
    });
});
