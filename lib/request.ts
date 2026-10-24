// parse a json object body, returns null if it's missing, malformed or not an object
export async function readJSON(req: Request): Promise<Record<string, any> | null> {
    try {
        const body = await req.json();
        return body && typeof body === "object" && !Array.isArray(body) ? body : null;
    } catch (error) {
        return null;
    }
}

export const invalidBodyResponse = () =>
    new Response(JSON.stringify({ error: "Invalid request body" }), {
        status: 400,
    });
