import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {NextRequest} from "next/server";
import rateLimitMiddleware from "@/lib/rateLimit";

const requestFrom = (ip: string) => new NextRequest("http://localhost/builds", {
    headers: { "x-forwarded-for": ip },
});

describe("rateLimitMiddleware", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("allows requests up to the limit, then blocks", () => {
        const limiter = rateLimitMiddleware({ windowMs: 10_000, max: 3 });

        expect(limiter(requestFrom("10.0.0.1")).success).toBe(true);
        expect(limiter(requestFrom("10.0.0.1")).success).toBe(true);
        expect(limiter(requestFrom("10.0.0.1")).success).toBe(true);
        expect(limiter(requestFrom("10.0.0.1")).success).toBe(false);
    });

    it("counts each ip separately", () => {
        const limiter = rateLimitMiddleware({ windowMs: 10_000, max: 1 });

        expect(limiter(requestFrom("10.0.0.2")).success).toBe(true);
        expect(limiter(requestFrom("10.0.0.3")).success).toBe(true);
        expect(limiter(requestFrom("10.0.0.2")).success).toBe(false);
    });

    it("resets once the window has passed", () => {
        const limiter = rateLimitMiddleware({ windowMs: 10_000, max: 1 });

        expect(limiter(requestFrom("10.0.0.4")).success).toBe(true);
        expect(limiter(requestFrom("10.0.0.4")).success).toBe(false);

        vi.advanceTimersByTime(10_001);

        expect(limiter(requestFrom("10.0.0.4")).success).toBe(true);
    });
});
