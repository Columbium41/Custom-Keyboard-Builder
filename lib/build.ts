import {Photo} from "@prisma/client";

export interface BuildIF {
    build_id: number,
    title: string,
    case: string,
    pcb: string,
    plate: string,
    switches: string,
    keycaps: string,
    mods: string,
    createdAt: Date,
    updatedAt: Date,
    photos: Photo[],
    user: {
        username: string,
        avatar: Photo | null,
    },
}