import {NextRequest} from "next/server";

// build a request for calling a route handler directly
export function jsonRequest(method: string, url: string, body?: unknown) {
    return new NextRequest(new URL(url, "http://localhost:3100"), {
        method,
        headers: { "Content-Type": "application/json" },
        body: body === undefined ? undefined : JSON.stringify(body),
    });
}

export async function readResponse(res: Response) {
    return { status: res.status, body: await res.json() };
}
