'use client';

import Image from "next/image"
import Link from "next/link"
import "./Header.css"
import {useSession} from "next-auth/react";
import {Skeleton, Stack} from "@chakra-ui/react";
import {AuthenticatedProfile} from "@/components/Header/AuthenticatedProfile";
import {UnauthenticatedProfile} from "@/components/Header/UnauthenticatedProfile";
import {ResponsiveProfile} from "@/components/Header/ResponsiveProfile";

export default function Header() {
    const { data: session, status } = useSession();

    return (
        <header>
            <div className="h-18 flex items-center justify-between md:px-12 px-2 border-b border-b-1 border-neutral-700 relative z-10">
                {/* Logo */}
                <Link href='/' className="max-w-1/2 h-4/5 flex">
                    <div className="w-16 h-full relative">
                        <Image 
                        src="/logo.ico"
                        alt="Logo"
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                    </div>
                    <h1 className="my-auto text-xl ubuntu-medium select-none hidden md:block">
                        MechForum
                    </h1>
                </Link>

                {/* User Profile Actions */}
                { status === 'loading' ? (
                    <div className="w-1/2 h-full flex items-center justify-end gap-x-2.5">
                        <Stack className="w-36" gap={1.5}>
                            <Skeleton className="!w-full !h-1" />
                            <Skeleton className="!w-full !h-1" />
                            <Skeleton className="!w-full !h-1" />
                        </Stack>
                    </div>
                ) : (
                    <ResponsiveProfile session={session} status={status} />
                )}
                { (status === 'authenticated' && session && session.user) && (
                    <AuthenticatedProfile session={session} />
                )}
                { (status === 'unauthenticated') && (
                    <UnauthenticatedProfile />
                )}
            </div>
        </header>
    )
}
