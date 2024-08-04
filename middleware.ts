import {NextRequest, NextResponse} from "next/server";
import { getToken } from "next-auth/jwt";
import rateLimitMiddleware from "@/lib/rateLimit";

const rateLimiter = rateLimitMiddleware({
    windowMs: 1000 * 10, // 10 seconds
    max: 8,
})

export const config = {
    matcher: [
        "/users/:path*",
        "/builds/:path*"
    ]
}

export default async function middleware(req: NextRequest) {
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

    const { success } = rateLimiter(req);

    return success ? NextResponse.next() : NextResponse.redirect(new URL('/blocked', req.url))
}
