import Image from "next/image"
import Link from "next/link"
import Button from "./Button"

export default function Header() {
    return (
        <header>
            {/* Top Header */}
            <div className="h-20 flex items-center justify-between px-4 bg-neutral-900 border-b border-b-1 border-neutral-500">
                <Link href='/' className="max-w-1/2 h-4/5 pr-3 flex">
                    <div className="w-20 h-full relative">
                        <Image 
                        src="/logo.ico"
                        alt="Logo"
                        layout="fill"
                        objectFit="contain"
                        />
                    </div>
                    <h1 className="my-auto text-xl ubuntu-medium select-none text-neutral-200">
                        Custom Keyboard Builder
                    </h1>
                </Link>

                <div className="w-1/2 h-full flex items-center justify-end gap-x-3">
                    <Button text="Log In" className="bg-neutral-200 text-black"></Button>
                    <Button text="Sign Up" className="bg-cyan-500 text-black"></Button>
                </div>
            </div>

            {/* Navigation */}
            <nav>

            </nav>
        </header>
    )
}
