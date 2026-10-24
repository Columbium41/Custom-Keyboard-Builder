import {NextRequest, NextResponse} from "next/server";
import { getToken } from "next-auth/jwt";
import rateLimitMiddleware from "@/lib/rateLimit";

const rateLimiter = rateLimitMiddleware({
    windowMs: 1000 * 10, // 10 seconds
    max: 8,
})

const COMPLETE_PROFILE_PAGE = "/complete_profile";
const COMPLETE_PROFILE_API = "/api/users/complete_profile";

export const config = {
    matcher: [
        // everything except next-auth, next internals and static files
        "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\..*).*)"
    ]
}

export default async function middleware(req: NextRequest) {
    const pathname = req.nextUrl.pathname;
    const token = await getToken({ req });
    const isAuthenticated = !!token;

    // oauth users must choose a username before using the site
    const needsUsername = isAuthenticated && !token.name;

    if (needsUsername && pathname.startsWith("/api") && pathname !== COMPLETE_PROFILE_API) {
        return new NextResponse(JSON.stringify({ error: 'Please choose a username first' }), { status: 403 });
    } else if (needsUsername && !pathname.startsWith("/api") && pathname !== COMPLETE_PROFILE_PAGE) {
        return NextResponse.redirect(new URL(COMPLETE_PROFILE_PAGE, req.url));
    } else if (!needsUsername && pathname === COMPLETE_PROFILE_PAGE) {
        return NextResponse.redirect(new URL(isAuthenticated ? '/' : '/signin', req.url));
    }

    // auth gate & rate limiting only apply to user and build pages
    if (!pathname.startsWith("/users") && !pathname.startsWith("/builds")) {
        return NextResponse.next();
    }

    // check if user is authenticated for secured routes
    if (!isAuthenticated && (
        pathname.startsWith("/users") ||
        (pathname.startsWith("/builds") && pathname !== "/builds")
    )) {
        return NextResponse.redirect(new URL('/signin', req.url));
    }

    // e2e tests make more requests than the limit allows (set in playwright.config.ts only)
    if (process.env.DISABLE_RATE_LIMIT === "true") {
        return NextResponse.next();
    }

    const { success } = rateLimiter(req);

    return success ? NextResponse.next() : NextResponse.redirect(new URL('/blocked', req.url))
}
