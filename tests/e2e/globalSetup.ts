import {loadTestEnv} from "../setup/env";
import {resetTestDatabase} from "../setup/db";

// pages compiled on first request can take longer than a test's timeout in dev mode
const WARM_UP_PATHS = ["/signin", "/builds", "/api/auth/session", "/api/builds/pages?page=1&limit=1"];

export default async function globalSetup() {
    loadTestEnv();
    resetTestDatabase();

    for (const path of WARM_UP_PATHS) {
        await fetch(`${process.env.NEXTAUTH_URL}${path}`).catch(() => undefined);
    }
}
