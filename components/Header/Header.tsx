'use client';

import Image from "next/image"
import Link from "next/link"
import "./Header.css"
import {LoginButton, LogoutButton, SignupButton} from "@/components/auth/auth";
import {useSession} from "next-auth/react";
import {Button, Divider, Skeleton, Stack} from "@chakra-ui/react";
import {useRouter} from "next/navigation";

export default function Header() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const handleUserClick = () => {
        if (session && session.user) {
            router.push(`/users/${encodeURIComponent(session.user.name || '')}`);
        }
    };

    return (
        <header className="bg-neutral-900 text-neutral-200">
            <div className="h-18 flex items-center justify-between px-12 border-b border-b-1 border-neutral-700">
                {/* Logo */}
                <Link href='/' className="max-w-1/2 h-4/5 flex z-10">
                    <div className="w-20 h-full relative">
                        <Image 
                        src="/logo.ico"
                        alt="Logo"
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                    </div>
                    <h1 className="my-auto text-xl ubuntu-medium select-none">
                        MechForum
                    </h1>
                </Link>

                {/* User Profile Actions */}
                { status === 'loading' && (
                    <div className="w-1/2 h-full flex items-center justify-end gap-x-2.5">
                        <Stack className="w-36" gap={1.5}>
                            <Skeleton className="!w-full !h-1" />
                            <Skeleton className="!w-full !h-1" />
                            <Skeleton className="!w-full !h-1" />
                        </Stack>
                    </div>
                )}

                { (status === 'authenticated' && session && session.user) && (
                    <div className="w-1/2 h-full flex items-center justify-end gap-x-2.5">
                        <Button
                            color="whiteAlpha.800"
                            _hover={{
                                color: "orange.400",
                            }}
                            variant="link"
                            onClick={() => handleUserClick()}
                        >
                            { session.user.name }
                        </Button>
                        <Divider orientation="vertical" className="!h-1/3" />
                        <LogoutButton />
                    </div>
                )}

                { (status === 'unauthenticated') && (
                    <div className="w-1/2 h-full flex items-center justify-end gap-x-2.5">
                        <LoginButton/>
                        <Divider orientation="vertical" className="!h-1/3" />
                        <SignupButton/>
                    </div>
                )}

            </div>
        </header>
    )
}
