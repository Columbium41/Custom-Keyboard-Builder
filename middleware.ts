import {Ratelimit} from "@upstash/ratelimit";
import { kv } from "@vercel/kv";
import {NextRequest, NextResponse} from "next/server";
import { getToken } from "next-auth/jwt";

const rateLimit = new Ratelimit({
    redis: kv,
    limiter: Ratelimit.slidingWindow(5, '10 s'),
});

export const config = {
    matcher: [
        "/users/:path*",
        "/builds/:path*"
    ]
}

export default async function middleware(req: NextRequest) {
    const ip = req.ip ?? '127.0.0.1';
    const pathname = req.nextUrl.pathname;
    const token = await getToken({ req });
    const isAuthenticated = !!token;

    // check if user is authenticated for secured routes
    if (!isAuthenticated && (
        pathname.startsWith("/users") ||
        (pathname.startsWith("/builds") && pathname !== "/builds")
    )) {
        return NextResponse.redirect(new URL('/signin', req.url));
    }

    if (process.env.NODE_ENV === 'production') {
        const { success, pending, limit, reset, remaining } = await rateLimit.limit(ip);

        return success ? NextResponse.next() : NextResponse.redirect(new URL('/blocked', req.url))
    }

    return NextResponse.next();
}
