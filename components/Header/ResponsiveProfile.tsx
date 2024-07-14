'use client';

import {Session} from "next-auth";
import {MoonIcon, SunIcon} from "@chakra-ui/icons";
import {Button, useColorMode} from "@chakra-ui/react";
import {NavigationDrawer} from "@/components/Navigation/NavigationDrawer";
import {AccountDrawer} from "@/components/Header/AccountDrawer";

interface ResponsiveProfileProps {
    session: Session | null,
    status: "authenticated" | "unauthenticated" | "loading"
}

export function ResponsiveProfile({ session, status }: ResponsiveProfileProps) {
    const { colorMode, toggleColorMode } = useColorMode();

    return (
        <div className="lg:hidden flex h-full items-center justify-end gap-x-4">
            <NavigationDrawer />
            <AccountDrawer session={session} status={status} />

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
}