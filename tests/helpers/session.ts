import type {Session} from "next-auth";
import type {User} from "@prisma/client";

// session returned by the mocked getServerSession (see tests/setup/setup.ts)
let currentSession: Session | null = null;

export const getMockSession = () => currentSession;

export function signInAs(user: Pick<User, "id" | "email" | "username" | "createdAt" | "updatedAt">) {
    currentSession = {
        user: {
            id: user.id.toString(),
            name: user.username,
            email: user.email,
            image: null,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        },
        expires: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    };
}

export function signOut() {
    currentSession = null;
}
