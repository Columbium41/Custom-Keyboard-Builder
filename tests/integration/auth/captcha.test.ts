import {describe, expect, it, vi} from "vitest";
import axios from "axios";
import {verifyCaptcha} from "@/lib/recaptcha";
import {POST as signup} from "@/app/api/auth/signup/route";
import {POST as sendReset} from "@/app/api/auth/send_password_reset/route";
import {POST as sendVerification} from "@/app/api/auth/send_email_verification/route";
import {prisma} from "@/lib/prisma";
import {sendEmailVerification} from "@/mailer/emailVerification";
import {sendPasswordReset} from "@/mailer/passwordReset";
import {jsonRequest, readResponse} from "../../helpers/request";
import {createUser} from "../../helpers/factories";

const CAPTCHA_ERROR = "Please verify the captcha";

describe("verifyCaptcha", () => {
    it("sends the secret and token to google", async () => {
        expect(await verifyCaptcha("captcha-token")).toBe(true);

        const [url, body] = vi.mocked(axios.post).mock.calls[0];
        expect(url).toBe("https://www.google.com/recaptcha/api/siteverify");
        const params = body as URLSearchParams;
        expect(params.get("secret")).toBe(process.env.RECAPTCHA_SECRET_KEY);
        expect(params.get("response")).toBe("captcha-token");
    });

    it("fails when google rejects the token", async () => {
        vi.mocked(axios.post).mockResolvedValue({ data: { success: false, "error-codes": ["timeout-or-duplicate"] } });
        expect(await verifyCaptcha("captcha-token")).toBe(false);
    });

    it("fails when google can't be reached", async () => {
        vi.mocked(axios.post).mockRejectedValue(new Error("network down"));
        expect(await verifyCaptcha("captcha-token")).toBe(false);
    });

    it.each([undefined, null, "", 123])("fails without calling google for token %j", async (token) => {
        expect(await verifyCaptcha(token)).toBe(false);
        expect(axios.post).not.toHaveBeenCalled();
    });
});

// each route that sends email must check the captcha on the server, not just in the browser
describe.each([
    {
        route: "/api/auth/signup",
        handler: signup,
        body: async () => ({ username: "New Member", email: "new@example.com", password: "password123", passwordConfirmation: "password123" }),
        mailer: sendEmailVerification,
    },
    {
        route: "/api/auth/send_password_reset",
        handler: sendReset,
        body: async () => ({ email: (await createUser()).email }),
        mailer: sendPasswordReset,
    },
    {
        route: "/api/auth/send_email_verification",
        handler: sendVerification,
        body: async () => ({ email: (await createUser({ verified: false })).email }),
        mailer: sendEmailVerification,
    },
])("POST $route captcha", ({ route, handler, body, mailer }) => {
    const send = async (extra: Record<string, unknown>) =>
        readResponse(await handler(jsonRequest("POST", route, { ...(await body()), ...extra })));

    it("rejects a request without a captcha token", async () => {
        const request = jsonRequest("POST", route, await body());
        const userCount = await prisma.user.count();
        const { status, body: resBody } = await readResponse(await handler(request));

        expect(status).toBe(400);
        expect(resBody.error).toBe(CAPTCHA_ERROR);
        expect(mailer).not.toHaveBeenCalled();
        expect(await prisma.user.count()).toBe(userCount);
    });

    it("rejects a token google says is invalid", async () => {
        vi.mocked(axios.post).mockResolvedValue({ data: { success: false } });
        const { status, body } = await send({ captchaToken: "bad-token" });

        expect(status).toBe(400);
        expect(body.error).toBe(CAPTCHA_ERROR);
        expect(mailer).not.toHaveBeenCalled();
    });

    it("accepts a valid token", async () => {
        const { status } = await send({ captchaToken: "captcha-token" });

        expect(status).toBe(200);
        expect(mailer).toHaveBeenCalledTimes(1);
    });
});
