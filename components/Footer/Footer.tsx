import Link from "next/link";

// google requires the home page to link to the privacy policy, so this is on every page
export default function Footer() {
    return (
        <footer className="mt-auto border-t border-neutral-700 py-4 text-sm text-center">
            <div className="flex justify-center gap-6">
                <Link href="/privacy" className="hover:text-orange-300">Privacy Policy</Link>
                <Link href="/terms" className="hover:text-orange-300">Terms of Service</Link>
            </div>
            <p className="mt-1 opacity-70">&copy; {new Date().getFullYear()} MechForum</p>
        </footer>
    );
}
