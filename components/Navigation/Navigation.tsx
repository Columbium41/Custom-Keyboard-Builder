import Link from "next/link";
import LazySVG from "@/components/LazySVG/LazySVG";
import HeaderSearchInput from "@/components/HeaderSearchInput/HeaderSearchInput";
import "@/components/Header/Header.css";

export default function Navigation() {
    const navigationLinks = [
        { name: "Builder", to: "/build" },
        { name: "Parts", to: "/parts" },
        { name: "User Builds", to: "/builds" }
    ];
    return (
        <nav className="bg-neutral-900 text-neutral-200 border-b border-b-1 border-neutral-700 h-14 px-28 flex">
            {/* Navigation Links */}
            <div className="w-1/2 flex border-borders-between-columns">
                {navigationLinks.map((link, index) => (
                    <Link href={link.to} key={index}
                          className="flex h-full my-auto text-neutral-400 transition-colors duration-150 hover:text-orange-300">
                        <div className="w-14 h-5/6 relative mr-1.5 my-auto">
                            <LazySVG name={link.to.substring(1)} className="w-full h-full fill-current stroke-current"/>
                        </div>
                        <h4 className="my-auto mr-2 text-neutral-200">
                            {link.name}
                        </h4>
                    </Link>
                ))}
            </div>

            {/* Search */}
            <div className="w-1/2 flex justify-end text-neutral-400 transition-colors duration-150">
                <HeaderSearchInput/>
                { /* TODO: implement backend for search feature */}
                <div className="w-12 h-3/4 my-auto">
                    <LazySVG name="search" className="w-full h-full stroke-current hover:text-orange-300 cursor-pointer"/>
                </div>
            </div>
        </nav>
    )
}