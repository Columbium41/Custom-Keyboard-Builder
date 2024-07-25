'use client';

import {Drawer, DrawerCloseButton, DrawerContent, DrawerHeader, DrawerOverlay} from "@chakra-ui/modal";
import {useDisclosure} from "@chakra-ui/hooks";
import {DrawerBody} from "@chakra-ui/react";
import {HamburgerIcon} from "@chakra-ui/icons";
import {navigationLinks} from "@/components/Navigation/Navigation";
import Link from "next/link";
import Image from "next/image";

export function NavigationDrawer() {
    const { isOpen, onOpen, onClose } = useDisclosure();

    const handleClick = () => {
        onOpen();
    };

    return (
        <>
            <HamburgerIcon
                boxSize={"1.75em"}
                color="inherit"
                _hover={{color: "orange.300"}}
                className={"cursor-pointer"}
                onClick={handleClick}
            />

            <Drawer isOpen={isOpen} onClose={onClose} size={'sm'}>
                <DrawerOverlay />
                <DrawerContent>
                    <DrawerCloseButton color="white" />
                    <DrawerHeader>Navigation</DrawerHeader>
                    <DrawerBody className="!p-0">
                        {navigationLinks.map((link, index) => (
                            <Link href={link.to} key={index} onClick={onClose}
                                  className="flex flex-row h-16 my-auto transition-colors duration-150 hover:text-orange-300 border-b border-inherit">
                                    <div className={"w-1/5 relative p-1"}>
                                        <div className={"w-full h-full relative"}>
                                            <Image
                                                src={`/${link.to.replaceAll('/', '')}.svg`}
                                                alt={''}
                                                fill
                                                className="object-contain"
                                            />
                                        </div>
                                    </div>
                                    <div className={"w-4/5 text-lg font-semibold flex items-center"}>
                                        { link.name }
                                    </div>
                            </Link>
                        ))}
                    </DrawerBody>
                </DrawerContent>
            </Drawer>
        </>
    )
}