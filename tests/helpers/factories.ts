import {hash} from "bcrypt";
import {prisma} from "@/lib/prisma";
import type {Prisma} from "@prisma/client";

let counter = 0;
const next = () => ++counter;

export const DEFAULT_PASSWORD = "password123";

// low bcrypt cost keeps tests fast, compare() works with any cost
export async function createUser(overrides: Partial<Prisma.UserUncheckedCreateInput> & { plainPassword?: string | null } = {}) {
    const n = next();
    const { plainPassword = DEFAULT_PASSWORD, ...data } = overrides;

    return prisma.user.create({
        data: {
            email: `user${n}@example.com`,
            username: `Test User ${n}`,
            verified: true,
            password: plainPassword === null ? null : await hash(plainPassword, 4),
            ...data,
        }
    });
}

export async function createBuild(userId: number, overrides: Partial<Prisma.BuildUncheckedCreateInput> = {}) {
    const n = next();

    return prisma.build.create({
        data: {
            title: `Build ${n}`,
            case: "Singa Kohaku R1",
            plate: "Aluminum",
            switches: "Cherry MX Browns",
            keycaps: "GMK Striker",
            userId: userId,
            ...overrides,
        }
    });
}

export async function createBuildPhoto(buildId: string, overrides: Partial<Prisma.PhotoUncheckedCreateInput> = {}) {
    const key = `photo${next()}`;

    return prisma.photo.create({
        data: {
            buildId: buildId,
            filename: key,
            fileURL: `https://${process.env.AWS_BUCKET_URL}/${key}`,
            mimetype: "image/png",
            size: 1000,
            ...overrides,
        }
    });
}

// the build payload the create / edit forms send
export function buildPayload(overrides: Record<string, unknown> = {}) {
    return {
        title: "My Build",
        caseValue: "Singa Kohaku R1",
        pcb: "Hotswap",
        plate: "Aluminum",
        switches: "Cherry MX Browns",
        keycaps: "GMK Striker",
        stabs: "Durock V2",
        mods: "tape mod",
        youtube_link: "",
        ...overrides,
    };
}
