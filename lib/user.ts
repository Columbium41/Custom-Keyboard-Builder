import {prisma} from "@/lib/prisma";
import {Photo, Build} from "@prisma/client";

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
    builds: Build[] | null;
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
            builds: true,
        },
    });

    return user;
}
