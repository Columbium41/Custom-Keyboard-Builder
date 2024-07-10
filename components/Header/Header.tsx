'use client';

import Image from "next/image"
import Link from "next/link"
import "./Header.css"
import {LoginButton, LogoutButton, SignupButton} from "@/components/auth/auth";
import {useSession} from "next-auth/react";
import {Button, Divider, Skeleton, Stack, useColorMode, useColorModeValue} from "@chakra-ui/react";
import {useRouter} from "next/navigation";
import {MoonIcon, SunIcon} from "@chakra-ui/icons";

export default function Header() {
    const { colorMode, toggleColorMode } = useColorMode();
    const { data: session, status } = useSession();
    const router = useRouter();
    const dividerBGs = useColorModeValue('whiteAlpha.600', 'whiteAlpha.700');

    const handleUserClick = () => {
        if (session && session.user) {
            router.push(`/users/${encodeURIComponent(session.user.name || '')}`);
        }
    };

    return (
        <header>
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
                            color="inherit"
                            _hover={{
                                color: "orange.400",
                            }}
                            variant="link"
                            onClick={() => handleUserClick()}
                        >
                            { session.user.name }
                        </Button>
                        <Divider orientation="vertical" className="!h-1/3" borderColor={dividerBGs} />
                        <LogoutButton />
                        <Divider orientation="vertical" className="!h-1/3" borderColor={dividerBGs} />
                        { colorMode === 'light' ? (
                            <Button className="!p-1" bg="purple.500" _hover={{ bg: "purple.600" }} onClick={toggleColorMode}>
                                <MoonIcon boxSize={"1.25em"} />
                            </Button>
                        ) : (
                            <Button className="!p-1" bg="orange.400" _hover={{ bg: "orange.300" }} onClick={toggleColorMode}>
                                <SunIcon boxSize={"1.25em"} />
                            </Button>
                        ) }
                    </div>
                )}
                { (status === 'unauthenticated') && (
                    <div className="w-1/2 h-full flex items-center justify-end gap-x-2.5">
                        <LoginButton/>
                        <Divider orientation="vertical" className="!h-1/3" borderColor={dividerBGs} />
                        <SignupButton/>
                        <Divider orientation="vertical" className="!h-1/3" borderColor={dividerBGs} />
                        { colorMode === 'light' ? (
                            <Button className="!p-1" bg="purple.500" _hover={{ bg: "purple.600" }} onClick={toggleColorMode} >
                                <MoonIcon boxSize={"1.25em"} />
                            </Button>
                        ) : (
                            <Button className="!p-1" bg="orange.400" _hover={{ bg: "orange.300" }} onClick={toggleColorMode}>
                                <SunIcon boxSize={"1.25em"} />
                            </Button>
                        ) }
                    </div>
                )}
            </div>
        </header>
    )
}
