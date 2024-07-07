'use client'

import { signIn, signOut } from "next-auth/react";
import {Button} from "@chakra-ui/react";
import {useRouter} from "next/navigation";

export const LoginButton = () => {
    return (
        <Button
            color="whiteAlpha.800"
            _hover={{
                color: "orange.400",
            }}
            variant="link"
            onClick={() => signIn()}
        >Login</Button>
    )
}

export const LogoutButton = () => {
    return (
        <Button
            color="whiteAlpha.800"
            _hover={{
                color: "orange.400",
            }}
            variant="link"
            onClick={() => signOut()}
        >Logout</Button>
    )
}

export const SignupButton = () => {
    const router = useRouter();

    return (
        <Button
            color="whiteAlpha.800"
            _hover={{
                color: "orange.400",
            }}
            variant="link"
            onClick={() => router.push("/signup")}
        >Sign Up</Button>
    )
}
