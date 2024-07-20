'use client';

import {Photo} from "@prisma/client";
import Image from "next/image";
import {BuildIF} from "@/lib/build";
import Link from "next/link";
import {Avatar, useColorMode} from "@chakra-ui/react";

export function BuildCard({ build }: { build : BuildIF }) {
    const { colorMode } = useColorMode();

    return (
        <div className="w-1/4 rounded-t-lg rounded-b-lg shadow-lg hover:shadow-2xl transition-shadow duration-300 ease-in-out cursor-pointer">
            {/* Build thumbnail */}
            <div className="relative h-60 rounded-t-inherit">
                <Image
                    // @ts-ignore
                    src={build.photos.filter((photo: Photo) => photo.isThumbnail)[0].fileURL}
                    alt={"Build Thumbnail"}
                    fill
                    className="object-cover !rounded-t-inherit"
                    sizes="(max-width: 768px) 25vw"
                />
            </div>

            {/* Build Metadata */}
            <div className={"rounded-b-inherit px-2 py-2 text-start " + (colorMode === 'light' ? 'bg-neutral-100 text-black' : 'bg-neutral-700 text-white')}>
                <div className="flex flex-row items-center gap-2 px-1">
                    { build.user.avatar === null ?
                        <Avatar src={"/public/profile.svg"} size="sm" /> :
                        <Avatar src={build.user.avatar.fileURL} size="sm" />
                    }
                    <Link
                        href={`/users/${encodeURIComponent(build.user.username)}`}
                        className="!text-blue-400 hover:!underline"
                    >{ build.user.username }</Link>
                </div>
                <p className="mt-2 font-semibold text-lg">{ build.title }</p>

                <p className={"mt-1 text-sm " + (colorMode === 'light' ? 'text-gray-600' : 'text-gray-400')}>{ build.case }</p>
                <p className={"text-sm " + (colorMode === 'light' ? 'text-gray-600' : 'text-gray-400')}>{ build.keycaps }</p>
            </div>
        </div>
    )
}
