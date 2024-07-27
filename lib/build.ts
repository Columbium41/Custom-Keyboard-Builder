import {Like, Photo} from "@prisma/client";
import {prisma} from "@/lib/prisma";

export interface BuildIF {
    build_id: string,
    title: string,
    case: string,
    pcb: string,
    plate: string,
    switches: string,
    keycaps: string,
    stabilizers: string,
    youtubeLink: string | null,
    mods: string,
    createdAt: Date,
    updatedAt: Date,
    photos: Photo[],
    user: {
        username: string,
        avatar: Photo | null,
    },
    likes: Like[],
}

export const getImageDimensions = (src: string): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            resolve({ width: img.naturalWidth, height: img.naturalHeight });
        };
        img.src = src;
    });
};

export async function getBuildData(build_id: string) {
    const build = await prisma.build.findUnique({
        where: {
            build_id: build_id,
        },
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
    });

    return build;
}
