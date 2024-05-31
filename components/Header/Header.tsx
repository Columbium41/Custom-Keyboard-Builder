import Image from "next/image"
import Link from "next/link"
import LazySVG from "../LazySVG/LazySVG";
import "./Header.css"
import HeaderSearchInput from "../HeaderSearchInput/HeaderSearchInput";
import {LoginButton, LogoutButton, SignupButton} from "@/app/auth";
import { Session } from "next-auth";

interface HeaderProps {
    session: Session | null
}

export default function Header({ session }: HeaderProps) {
    const navigationLinks = [
        { name: "Builder", to: "/build" },
        { name: "Parts", to: "/parts" },
        { name: "User Builds", to: "/builds" }
    ];

    return (
        <header className="bg-neutral-900 text-neutral-200">
            {/* Top Header */}
            <div className="h-18 flex items-center justify-between px-12 border-b border-b-1 border-neutral-700">
                {/* Logo */}
                <Link href='/' className="max-w-1/2 h-4/5 flex">
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
                    {/* TODO: add link to user profile */}
                    { session && session.user !== undefined && (
                        <p>{ session.user.name }</p>
                    )}
                    { session && <LogoutButton /> }
                </div>
            </div>

            {/* Navigation */}
            <nav className="border-b border-b-1 border-neutral-700 h-14 px-28 flex">
                {/* Navigation Links */}
                <div className="w-1/2 flex border-borders-between-columns">
                    {navigationLinks.map((link, index) => (
                        <Link href={link.to} key={index} className="flex h-full my-auto text-neutral-400 transition-colors duration-150 hover:text-orange-300">
                            <div className="w-14 h-5/6 relative mr-1.5 my-auto">
                                <LazySVG name={link.to.substring(1)} className="w-full h-full fill-current stroke-current" />
                            </div>
                            <h4 className="my-auto mr-2 text-neutral-200">
                                { link.name }
                            </h4>
                        </Link>
                    ))}
                </div>

                {/* Search */}
                <div className="w-1/2 flex justify-end text-neutral-400 transition-colors duration-150">
                    <HeaderSearchInput />
                    { /* TODO: implement backend for search feature */ }
                    <div className="w-12 h-3/4 my-auto">
                        <LazySVG name="search" className="w-full h-full stroke-current hover:text-orange-300 cursor-pointer" />
                    </div>
                </div>
            </nav>
        </header>
    )
}
