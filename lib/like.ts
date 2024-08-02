import {prisma} from "@/lib/prisma";
import {BuildIF} from "@/lib/build";

export interface LikedBuildsIF {
    build: BuildIF
}

export async function getUserLikedBuilds(userId: number) {
    const likedBuilds = await prisma.like.findMany({
        where: {
            userId: Number(userId),
        },
        select: {
            build: {
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

    return likedBuilds;
}
