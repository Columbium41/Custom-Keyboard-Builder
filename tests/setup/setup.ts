import {afterAll, beforeEach, vi} from "vitest";
import {prisma} from "@/lib/prisma";
import {truncateAllTables} from "./db";
import {signOut} from "../helpers/session";
import {s3Mock} from "../helpers/s3";

// session is controlled per test with signInAs / signOut
vi.mock("next-auth", async (importOriginal) => {
    const { getMockSession } = await import("../helpers/session");
    return {
        ...(await importOriginal<typeof import("next-auth")>()),
        getServerSession: vi.fn(async () => getMockSession()),
    };
});

// never send real emails
vi.mock("@/mailer/emailVerification", () => ({
    sendEmailVerification: vi.fn(),
}));
vi.mock("@/mailer/passwordReset", () => ({
    sendPasswordReset: vi.fn(),
    sendPasswordResetConfirmation: vi.fn(),
}));

// never call youtube / recaptcha
vi.mock("axios", () => {
    const axios = { get: vi.fn(), post: vi.fn() };
    return { default: axios, ...axios };
});

beforeEach(async () => {
    await truncateAllTables(prisma);
    vi.clearAllMocks();
    signOut();
    s3Mock.reset();
});

afterAll(async () => {
    await prisma.$disconnect();
});
