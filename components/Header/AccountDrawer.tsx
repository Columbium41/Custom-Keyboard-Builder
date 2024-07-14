'use client';

import {Drawer, DrawerCloseButton, DrawerContent, DrawerHeader, DrawerOverlay} from "@chakra-ui/modal";
import {useDisclosure} from "@chakra-ui/hooks";
import {Button, DrawerBody} from "@chakra-ui/react";
import {Icon} from "@chakra-ui/icons";
import {GoPerson} from "react-icons/go";
import {Session} from "next-auth";
import {LoginButton, LogoutButton, SignupButton} from "@/components/auth/auth";
import {useRouter} from "next/navigation";
import Link from "next/link";

interface AccountDrawerProps {
    session: Session | null,
    status: "authenticated" | "unauthenticated" | "loading"
}

export function AccountDrawer({ session, status }: AccountDrawerProps) {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const router = useRouter();

    const handleClick = () => {
        onOpen();
    };

    if (session && session.user) {
        return (
            <>
                <Icon
                    as={GoPerson}
                    boxSize={"1.75em"}
                    color="inherit"
                    _hover={{color: "orange.300"}}
                    onClick={handleClick}
                />

                <Drawer isOpen={isOpen} onClose={onClose} size={'sm'}>
                    <DrawerOverlay />
                    <DrawerContent>
                        <DrawerCloseButton color="white" />
                        <DrawerHeader>Account</DrawerHeader>
                        <DrawerBody className="!p-0">
                            <div className="w-full h-12 flex items-center border-b border-inherit px-3">
                                <div onClick={onClose}>
                                    <Link
                                        href={`/users/${encodeURIComponent(session.user.name || '')}`}
                                        color="inherit"
                                        className="font-semibold hover:text-orange-300"
                                    >
                                        Profile
                                    </Link>
                                </div>
                            </div>
                            <div className="w-full h-12 flex items-center border-b border-inherit px-3">
                                <div onClick={onClose}>
                                    <LogoutButton />
                                </div>
                            </div>
                        </DrawerBody>
                    </DrawerContent>
                </Drawer>
            </>
        )
    } else {
        return (
            <>
                <Icon as={GoPerson} boxSize={"1.75em"} color="inherit" _hover={{color: "orange.300"}} className={"cursor-pointer"} onClick={handleClick} />

                <Drawer isOpen={isOpen} onClose={onClose} size={'sm'}>
                    <DrawerOverlay />
                    <DrawerContent>
                        <DrawerCloseButton color="white" />
                        <DrawerHeader>Account</DrawerHeader>
                        <DrawerBody className="!p-0">
                                <div className="w-full h-12 flex items-center border-b border-inherit px-3">
                                    <div onClick={onClose}>
                                        <LoginButton />
                                    </div>
                                </div>
                                <div className="w-full h-12 flex items-center border-b border-inherit px-3">
                                    <div onClick={onClose}>
                                        <SignupButton />
                                    </div>
                                </div>
                        </DrawerBody>
                    </DrawerContent>
                </Drawer>
            </>
        )
    }
}