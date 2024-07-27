import {prisma} from "@/lib/prisma";
import {Like, Photo} from "@prisma/client";
import {BuildIF} from "@/lib/build";

export interface UserIF {
    id: number;
    email: string;
    username: string;
    verified: boolean;
    description: string | null;
    lastLogin: Date | null;
    createdAt: Date;
    updatedAt: Date;
    avatar: Photo | null;
    builds: BuildIF[] | null;
    likes: Like[];
}

export async function getUserData(username: string) {
    const user = await prisma.user.findUnique({
        where: {
            username: username,
        },
        select: {
            id: true,
            email: true,
            username: true,
            verified: true,
            description: true,
            lastLogin: true,
            createdAt: true,
            updatedAt: true,
            avatar: true,
            likes: true,
            builds: {
                select: {
                    build_id: true,
                    title: true,
                    case: true,
                    pcb: true,
                    plate: true,
                    switches: true,
                    keycaps: true,
                    stabilizers: true,
                    youtubeLink: true,
                    mods: true,
                    createdAt: true,
                    updatedAt: true,
                    photos: true,
                    user: {
                        select: {
                            username: true,
                            avatar: true,
                        },
                    },
                    likes: true,
                },
            },
        },
    });

    return user;
}
