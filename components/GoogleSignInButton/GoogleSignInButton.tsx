'use client';

import {signIn} from "next-auth/react";
import {Button} from "@chakra-ui/react";
import {FcGoogle} from "react-icons/fc";

export default function GoogleSignInButton() {
    return (
        <Button
            leftIcon={<FcGoogle />}
            bg="white"
            color="black"
            _hover={{ bg: "gray.200" }}
            className="mx-auto"
            width="auto"
            onClick={() => signIn('google', { callbackUrl: '/' })}
        >
            Continue with Google
        </Button>
    )
}

export function OrDivider() {
    return (
        <div className="flex flex-row items-center gap-3 my-4 text-neutral-400">
            <div className="flex-1 border-t border-neutral-500" />
            or
            <div className="flex-1 border-t border-neutral-500" />
        </div>
    )
}
