import {describe, expect, it, vi} from "vitest";
import jwt from "jsonwebtoken";
import {compare} from "bcrypt";
import {POST as sendReset} from "@/app/api/auth/send_password_reset/route";
import {PATCH as changePassword, POST as checkToken} from "@/app/api/auth/password_reset/route";
import {prisma} from "@/lib/prisma";
import {sendPasswordReset, sendPasswordResetConfirmation} from "@/mailer/passwordReset";
import {jsonRequest, readResponse} from "../../helpers/request";
import {createUser} from "../../helpers/factories";

const GOOGLE_ONLY_ERROR = "This account uses Google sign-in and does not have a password";

const resetToken = (userId: number, options: jwt.SignOptions = { expiresIn: "1h" }) =>
    jwt.sign({ userId }, process.env.PASSWORD_RESET_SECRET!, options);

describe("POST /api/auth/send_password_reset", () => {
    const send = async (email: string) =>
        readResponse(await sendReset(jsonRequest("POST", "/api/auth/send_password_reset", { email })));

    it("emails a reset token", async () => {
        const user = await createUser();

        const { status } = await send(user.email);
        expect(status).toBe(200);

        const [email, token] = vi.mocked(sendPasswordReset).mock.calls[0];
        expect(email).toBe(user.email);
        expect(jwt.verify(token, process.env.PASSWORD_RESET_SECRET!)).toMatchObject({ userId: user.id });
    });

    it("rejects an unknown email", async () => {
        const { status, body } = await send("nobody@example.com");
        expect(status).toBe(400);
        expect(body.error).toBe("Invalid email");
    });

    it("refuses google-only accounts", async () => {
        const user = await createUser({ plainPassword: null });

        const { status, body } = await send(user.email);
        expect(status).toBe(400);
        expect(body.error).toBe(GOOGLE_ONLY_ERROR);
        expect(sendPasswordReset).not.toHaveBeenCalled();
    });
});

describe("POST /api/auth/password_reset (check token)", () => {
    const check = async (token: unknown) =>
        readResponse(await checkToken(jsonRequest("POST", "/api/auth/password_reset", { token })));

    it("accepts a valid token", async () => {
        const user = await createUser();
        expect((await check(resetToken(user.id))).status).toBe(200);
    });

    it.each([
        ["missing", () => undefined],
        ["expired", (id: number) => resetToken(id, { expiresIn: -10 })],
        ["email verification", (id: number) => jwt.sign({ userId: id }, process.env.EMAIL_SECRET!)],
    ])("rejects a %s token", async (_, makeToken) => {
        const user = await createUser();

        const { status, body } = await check(makeToken(user.id));
        expect(status).toBe(400);
        expect(body.error).toBe("Invalid or expired token");
    });

    it("refuses google-only accounts", async () => {
        const user = await createUser({ plainPassword: null });

        const { status, body } = await check(resetToken(user.id));
        expect(status).toBe(400);
        expect(body.error).toBe(GOOGLE_ONLY_ERROR);
    });
});

describe("PATCH /api/auth/password_reset (change password)", () => {
    const change = async (body: Record<string, unknown>) =>
        readResponse(await changePassword(jsonRequest("PATCH", "/api/auth/password_reset", body)));

    it("changes the password and sends a confirmation", async () => {
        const user = await createUser();

        const { status } = await change({ token: resetToken(user.id), newPassword: "newpassword1", passwordConfirmation: "newpassword1" });
        expect(status).toBe(200);

        const updated = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
        expect(await compare("newpassword1", updated.password!)).toBe(true);
        expect(sendPasswordResetConfirmation).toHaveBeenCalledWith(user.email);
    });

    it.each([
        [{ newPassword: "short", passwordConfirmation: "short" }, "Passwords must be between 8 and 40 characters"],
        [{ newPassword: "newpassword1", passwordConfirmation: "different12" }, "Passwords do not match"],
    ])("rejects invalid passwords %j", async (passwords, message) => {
        const user = await createUser();

        const { status, body } = await change({ token: resetToken(user.id), ...passwords });
        expect(status).toBe(400);
        expect(body.error).toBe(message);
    });

    it("rejects an invalid token", async () => {
        const { status, body } = await change({ token: "garbage", newPassword: "newpassword1", passwordConfirmation: "newpassword1" });
        expect(status).toBe(400);
        expect(body.error).toBe("Invalid or expired token");
    });

    it("refuses to add a password to a google-only account", async () => {
        const user = await createUser({ plainPassword: null });

        const { status, body } = await change({ token: resetToken(user.id), newPassword: "newpassword1", passwordConfirmation: "newpassword1" });
        expect(status).toBe(400);
        expect(body.error).toBe(GOOGLE_ONLY_ERROR);
        expect((await prisma.user.findUniqueOrThrow({ where: { id: user.id } })).password).toBeNull();
    });
});
