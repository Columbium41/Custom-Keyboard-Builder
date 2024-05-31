'use client'

import { signIn, signOut } from "next-auth/react";
import Button from "@/components/Button/Button";

export const LoginButton = () => {
    return <Button text="Login" className="bg-neutral-200 text-black" onClick={() => signIn()}></Button>
}

export const LogoutButton = () => {
    return <Button text="Logout" className="bg-red-400 text-black" onClick={() => signOut()}></Button>
}

export const SignupButton = () => {
    return <Button text="Sign Up" className="bg-cyan-500 text-black"></Button>
}
