import { NextRequest } from 'next/server';

interface RateLimitOptions {
    windowMs: number;
    max: number;
}

interface RateLimitRecord {
    timestamp: number;
    count: number;
}

const rateLimitStore: Record<string, RateLimitRecord> = {};

export default function rateLimitMiddleware(options: RateLimitOptions) {
    return (req: NextRequest) => {
        const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || req.ip || '127.0.0.1';

        const now = Date.now();

        if (!rateLimitStore[ip]) {
            rateLimitStore[ip] = { timestamp: now, count: 1 };
        } else {
            const record = rateLimitStore[ip];
            const timePassed = now - record.timestamp;

            if (timePassed < options.windowMs) {
                if (record.count >= options.max) {
                    return { success: false };
                } else {
                    record.count += 1;
                }
            } else {
                rateLimitStore[ip] = { timestamp: now, count: 1 };
            }
        }

        return { success: true };
    };
}
