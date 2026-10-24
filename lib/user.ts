import {prisma} from "@/lib/prisma";
import {Like, Photo} from "@prisma/client";
import {BuildIF} from "@/lib/build";

export interface UserIF {
    id: number;
    username: string | null;
    description: string | null;
    createdAt: Date;
    updatedAt: Date;
    avatar: Photo | null;
    builds: BuildIF[] | null;
    likes: Like[];
}

// this is passed to client components, so only select fields that are safe to show anyone
export async function getUserData(username: string) {
    const user = await prisma.user.findUnique({
        where: {
            username: username,
        },
        select: {
            id: true,
            username: true,
            description: true,
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

// returns a newline separated list of problems with the username, or an empty string if valid
export function getUsernameErrors(username: string) {
    let errors = '';

    // check that username is minimum length
    if (username.length < 6 || username.length > 30) {
        errors += "Username must be between 6-30 characters\n";
    }

    // check that username is only alphanumerical characters and spaces
    const regex = /^[a-zA-Z0-9\s]+$/;
    if (!regex.test(username)) {
        errors += "Username can only contain alphanumerical characters and spaces\n";
    }

    return errors;
}
