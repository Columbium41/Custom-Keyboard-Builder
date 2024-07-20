'use client';

import {Button, Divider, useColorMode, useColorModeValue} from "@chakra-ui/react";
import {LogoutButton} from "@/components/auth/auth";
import {MoonIcon, SunIcon} from "@chakra-ui/icons";
import {Session} from "next-auth";
import Link from "next/link";

export function AuthenticatedProfile({ session }: { session: Session }) {
    const { colorMode, toggleColorMode } = useColorMode();
    const dividerBGs = useColorModeValue('whiteAlpha.600', 'whiteAlpha.700');

    if (session && session.user) {
        return (
            <div className="hidden w-1/2 h-full lg:flex items-center justify-end gap-x-2.5">
                <Link
                    href={`/users/${encodeURIComponent(session.user.name || '')}`}
                    color="inherit"
                    className="font-semibold hover:text-orange-300"
                >
                    { session.user.name }
                </Link>
                <Divider orientation="vertical" className="!h-1/3 hidden lg:block" borderColor={dividerBGs}/>
                <LogoutButton/>
                <Divider orientation="vertical" className="!h-1/3 hidden lg:block" borderColor={dividerBGs}/>
                {colorMode === 'light' ? (
                    <Button className="!p-1" bg="purple.500" _hover={{bg: "purple.600"}} onClick={toggleColorMode}>
                        <MoonIcon boxSize={"1.25em"}/>
                    </Button>
                ) : (
                    <Button className="!p-1" bg="orange.400" _hover={{bg: "orange.300"}} onClick={toggleColorMode}>
                        <SunIcon boxSize={"1.25em"}/>
                    </Button>
                )}
            </div>
        )
    } else {
        return <></>
    }
}