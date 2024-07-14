'use client';

import {Button, Divider, useColorMode, useColorModeValue} from "@chakra-ui/react";
import {LogoutButton} from "@/components/auth/auth";
import {MoonIcon, SunIcon} from "@chakra-ui/icons";
import {useRouter} from "next/navigation";
import {Session} from "next-auth";

export function AuthenticatedProfile({ session }: { session: Session }) {
    const router = useRouter();
    const { colorMode, toggleColorMode } = useColorMode();
    const dividerBGs = useColorModeValue('whiteAlpha.600', 'whiteAlpha.700');

    const handleUserClick = () => {
        if (session && session.user) {
            router.push(`/users/${encodeURIComponent(session.user.name || '')}`);
        }
    };

    if (session && session.user) {
        return (
            <div className="hidden w-1/2 h-full lg:flex items-center justify-end gap-x-2.5">
                <Button
                    color="inherit"
                    _hover={{
                        color: "orange.400",
                    }}
                    variant="link"
                    onClick={() => handleUserClick()}
                >
                    {session.user.name}
                </Button>
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