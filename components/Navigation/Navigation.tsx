import Link from "next/link";
import LazySVG from "@/components/LazySVG/LazySVG";
import "@/components/Header/Header.css";

export const navigationLinks = [
    { name: "Create Build", to: "/builds/new" },
    { name: "Completed Builds", to: "/builds" }
];

export default function Navigation() {
    return (
        <nav className="hidden border-b border-b-1 border-neutral-700 h-14 xl:px-28 lg:flex">
            {/* Navigation Links */}
            <div className="w-1/2 flex border-borders-between-columns">
                {navigationLinks.map((link, index) => (
                    <Link href={link.to} key={index}
                          className="flex h-full my-auto transition-colors duration-150 hover:text-orange-300">
                        <div className="w-14 h-5/6 relative mr-1.5 my-auto">
                            <LazySVG name={link.to.replaceAll('/', '')} className="w-full h-full fill-current stroke-current"/>
                        </div>
                        <h4 className="my-auto mr-2">
                            {link.name}
                        </h4>
                    </Link>
                ))}
            </div>

            {/* Search */}
            {/*<div className="w-1/2 flex justify-end transition-colors duration-150">*/}
            {/*    <NavigationSearch />*/}
            {/*    { /* TODO: implement backend for search feature *!/*/}
            {/*    <div className="w-12 h-3/4 my-auto">*/}
            {/*        <LazySVG name="search" className="w-full h-full stroke-current hover:text-orange-300 cursor-pointer"/>*/}
            {/*    </div>*/}
            {/*</div>*/}
        </nav>
    )
}