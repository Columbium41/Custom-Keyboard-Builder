'use client';

import Image from "next/image"
import Link from "next/link"
import "./Header.css"
import {LoginButton, LogoutButton, SignupButton} from "@/components/auth/auth";
import {useSession} from "next-auth/react";

export default function Header() {
    const { data: session } = useSession();

    return (
        <header className="bg-neutral-900 text-neutral-200">
            <div className="h-18 flex items-center justify-between px-12 border-b border-b-1 border-neutral-700">
                {/* Logo */}
                <Link href='/' className="max-w-1/2 h-4/5 flex z-10">
                    <div className="w-20 h-full relative">
                        <Image 
                        src="/logo.ico"
                        alt="Logo"
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                    </div>
                    <h1 className="my-auto text-xl ubuntu-medium select-none">
                        Custom Keyboard Builder
                    </h1>
                </Link>

                {/* User Profile Actions */}
                <div className="w-1/2 h-full flex items-center justify-end gap-x-3">
                    { !session && <LoginButton /> }
                    { session && session.user !== undefined && (
                        <Link
                            href={`/users/${encodeURIComponent(session.user.name || '')}`}
                            className="transition-all duration-300 hover:text-orange-300"
                        >
                            { session.user.name }
                        </Link>
                    )}
                    { session && <LogoutButton /> }
                    { !session && <SignupButton />}
                </div>
            </div>
        </header>
    )
}
