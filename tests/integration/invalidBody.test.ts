import {describe, expect, it} from "vitest";
import {NextRequest} from "next/server";
import {POST as signup} from "@/app/api/auth/signup/route";
import {POST as sendReset} from "@/app/api/auth/send_password_reset/route";
import {POST as sendVerification} from "@/app/api/auth/send_email_verification/route";
import {PATCH as changePassword, POST as checkResetToken} from "@/app/api/auth/password_reset/route";
import {POST as verifyEmail} from "@/app/api/auth/verify_email/route";
import {POST as newBuild} from "@/app/api/builds/new/route";
import {PATCH as editBuild} from "@/app/api/builds/edit/route";
import {DELETE as deleteBuild} from "@/app/api/builds/delete/route";
import {POST as likeBuild} from "@/app/api/builds/like/route";
import {PATCH as updateDescription} from "@/app/api/users/update_description/route";
import {POST as completeProfile} from "@/app/api/users/complete_profile/route";
import {readResponse} from "../helpers/request";
import {createUser} from "../helpers/factories";
import {signInAs} from "../helpers/session";

// a raw body, jsonRequest() would stringify it
const rawRequest = (method: string, url: string, body: string | undefined) =>
    new NextRequest(new URL(url, "http://localhost:3100"), {
        method,
        headers: { "Content-Type": "application/json" },
        body,
    });

const routes: [string, string, (req: NextRequest) => Promise<Response>][] = [
    ["POST", "/api/auth/signup", signup],
    ["POST", "/api/auth/send_password_reset", sendReset],
    ["POST", "/api/auth/send_email_verification", sendVerification],
    ["POST", "/api/auth/password_reset", checkResetToken],
    ["PATCH", "/api/auth/password_reset", changePassword],
    ["POST", "/api/auth/verify_email", verifyEmail],
    ["POST", "/api/builds/new", newBuild],
    ["PATCH", "/api/builds/edit", editBuild],
    ["DELETE", "/api/builds/delete", deleteBuild],
    ["POST", "/api/builds/like", likeBuild],
    ["PATCH", "/api/users/update_description", updateDescription],
    ["POST", "/api/users/complete_profile", completeProfile],
];

const badBodies: [string, string | undefined][] = [
    ["empty", undefined],
    ["truncated", '{"username": "Cut Of'],
    ["null", "null"],
    ["an array", "[]"],
];

// a client that disconnects mid-request or sends garbage should get a 400, not an empty 500
describe.each(routes)("%s %s with a bad body", (method, url, handler) => {
    it.each(badBodies)("rejects a body that is %s", async (_, body) => {
        signInAs(await createUser());

        const { status, body: resBody } = await readResponse(await handler(rawRequest(method, url, body)));
        expect(status).toBe(400);
        expect(resBody.error).toBe("Invalid request body");
    });
});
