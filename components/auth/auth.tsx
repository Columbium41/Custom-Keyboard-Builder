'use client'

import { signIn, signOut } from "next-auth/react";
import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogContent, AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
    Button
} from "@chakra-ui/react";
import {useRouter} from "next/navigation";
import {useDisclosure} from "@chakra-ui/hooks";
import {useRef} from "react";
import {FocusableElement} from "@chakra-ui/utils";

export const LoginButton = () => {
    return (
        <Button
            color="inherit"
            _hover={{
                color: "orange.400",
            }}
            variant="link"
            onClick={() => signIn()}
        >Login</Button>
    )
}

// logout alert dialog
export const LogoutButton = () => {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const cancelRef = useRef()

    return (
        <>
            <Button
                color="inherit"
                _hover={{
                    color: "orange.400",
                }}
                variant="link"
                onClick={onOpen}
            >Logout</Button>

            <AlertDialog
                isOpen={isOpen}
                // @ts-ignore
                leastDestructiveRef={cancelRef}
                onClose={onClose}
            >
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader fontSize='lg' fontWeight='bold' borderTopRadius='md'>
                            Logout
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            Are you sure you want to logout?
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button
                                // @ts-ignore
                                ref={cancelRef}
                                onClick={onClose}
                            >
                                Cancel
                            </Button>
                            <Button colorScheme='red' onClick={() => signOut()} ml={3}>
                                Logout
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </>
    )
}

export const SignupButton = () => {
    const router = useRouter();

    return (
        <Button
            color="inherit"
            _hover={{
                color: "orange.400",
            }}
            variant="link"
            onClick={() => router.push("/signup")}
        >Sign Up</Button>
    )
}
