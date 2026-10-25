import {describe, expect, it} from "vitest";
import {NextRequest} from "next/server";
import {encode} from "next-auth/jwt";
import middleware from "@/middleware";

let ipCounter = 0;

// each request gets its own ip so the rate limiter doesn't interfere, unless one is given
async function request(path: string, options: { name?: string | null, signedIn?: boolean, ip?: string, method?: string } = {}) {
    const { name = "Test User", signedIn = true, ip = `10.1.0.${++ipCounter}`, method = "GET" } = options;
    const headers: Record<string, string> = { "x-forwarded-for": ip };

    if (signedIn) {
        const token = await encode({ token: { id: "1", email: "user@example.com", name }, secret: process.env.NEXTAUTH_SECRET! });
        headers.cookie = `next-auth.session-token=${token}`;
    }

    return middleware(new NextRequest(new URL(path, "http://localhost:3100"), { headers, method }));
}

const redirectPath = (res: Response) => {
    const location = res.headers.get("location");
    return location ? new URL(location).pathname : null;
};

describe("middleware: authentication", () => {
    it.each(["/users/someone", "/builds/new", "/builds/abc123", "/builds/edit/abc123"])("redirects signed out users from %s to /signin", async (path) => {
        const res = await request(path, { signedIn: false });
        expect(redirectPath(res)).toBe("/signin");
    });

    it.each(["/", "/builds", "/signin", "/privacy", "/terms"])("lets signed out users view %s", async (path) => {
        const res = await request(path, { signedIn: false });
        expect(redirectPath(res)).toBeNull();
    });

    it("lets signed in users view protected pages", async () => {
        expect(redirectPath(await request("/builds/new"))).toBeNull();
        expect(redirectPath(await request("/users/someone"))).toBeNull();
    });
});

describe("middleware: username onboarding", () => {
    it.each(["/", "/builds", "/users/someone", "/builds/new"])("redirects users without a username from %s to /complete_profile", async (path) => {
        const res = await request(path, { name: null });
        expect(redirectPath(res)).toBe("/complete_profile");
    });

    it.each(["/privacy", "/terms"])("lets users without a username read %s", async (path) => {
        const res = await request(path, { name: null });
        expect(redirectPath(res)).toBeNull();
    });

    it("lets users without a username view /complete_profile", async () => {
        const res = await request("/complete_profile", { name: null });
        expect(redirectPath(res)).toBeNull();
    });

    it("blocks api calls from users without a username", async () => {
        const res = await request("/api/builds/new", { name: null, method: "POST" });
        expect(res.status).toBe(403);
        expect(await res.json()).toEqual({ error: "Please choose a username first" });
    });

    it("allows the complete_profile api for users without a username", async () => {
        const res = await request("/api/users/complete_profile", { name: null, method: "POST" });
        expect(res.status).toBe(200);
    });

    it("sends users who already have a username away from /complete_profile", async () => {
        expect(redirectPath(await request("/complete_profile"))).toBe("/");
    });

    it("sends signed out users from /complete_profile to /signin", async () => {
        expect(redirectPath(await request("/complete_profile", { signedIn: false }))).toBe("/signin");
    });
});

describe("middleware: rate limiting", () => {
    it("redirects to /blocked after 8 requests in 10 seconds from one ip", async () => {
        for (let i = 0; i < 8; i++) {
            expect(redirectPath(await request("/builds", { ip: "10.2.0.1" }))).toBeNull();
        }

        expect(redirectPath(await request("/builds", { ip: "10.2.0.1" }))).toBe("/blocked");
    });

    it("doesn't rate limit pages outside /users and /builds", async () => {
        for (let i = 0; i < 12; i++) {
            expect(redirectPath(await request("/", { ip: "10.2.0.2" }))).toBeNull();
        }
    });
});

describe("middleware: rate limit switch for e2e tests", () => {
    it("skips rate limiting when DISABLE_RATE_LIMIT is true", async () => {
        process.env.DISABLE_RATE_LIMIT = "true";
        try {
            for (let i = 0; i < 12; i++) {
                expect(redirectPath(await request("/builds", { ip: "10.2.0.3" }))).toBeNull();
            }
        } finally {
            delete process.env.DISABLE_RATE_LIMIT;
        }
    });
});
