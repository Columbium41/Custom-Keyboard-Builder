'use client'

import { signIn, signOut } from "next-auth/react";
import Button from "@/components/Button/Button";
import Link from "next/link";

export const LoginButton = () => {
    return <Button text="Login" className="bg-neutral-200 text-black" onClick={() => signIn()}></Button>
}

export const LogoutButton = () => {
    return <Button text="Logout" className="bg-red-400 text-black" onClick={() => signOut()}></Button>
}

export const SignupButton = () => {
    return <Link href='/signup' className="px-4 py-2 rounded-md font-semibold bg-cyan-500 text-black">Sign Up</Link>
}
