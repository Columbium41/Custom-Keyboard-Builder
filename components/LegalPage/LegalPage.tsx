import Link from "next/link";
import React from "react";
import {LEGAL_EFFECTIVE_DATE} from "@/lib/legal";

// shared layout for the privacy policy and terms of service
export default function LegalPage({ title, children }: { title: string, children: React.ReactNode }) {
    return (
        <main className="w-full max-w-3xl mx-auto px-4 py-8 leading-relaxed">
            <h1 className="text-3xl font-bold mb-1">{title}</h1>
            <p className="text-sm opacity-70 mb-8">Effective {LEGAL_EFFECTIVE_DATE}</p>
            <div className="flex flex-col gap-8">
                {children}
            </div>
        </main>
    );
}

export function LegalSection({ title, children }: { title: string, children: React.ReactNode }) {
    return (
        <section className="flex flex-col gap-3">
            <h2 className="text-xl font-semibold">{title}</h2>
            {children}
        </section>
    );
}

export function LegalList({ children }: { children: React.ReactNode }) {
    return <ul className="list-disc pl-6 flex flex-col gap-1.5">{children}</ul>;
}

export function LegalLink({ href, children }: { href: string, children: React.ReactNode }) {
    const className = "underline text-blue-400 hover:text-orange-300";

    return href.startsWith("/") ?
        <Link href={href} className={className}>{children}</Link> :
        <a href={href} className={className} target="_blank" rel="noopener noreferrer">{children}</a>;
}

// shown where accounts get created, links open in a new tab so the form isn't lost
export function AgreementNotice({ action, className }: { action: string, className?: string }) {
    const linkClass = "underline hover:text-orange-300";

    return (
        <p className={"text-xs text-center opacity-80 " + (className ?? "")}>
            By {action}, you agree to our{" "}
            <a href="/terms" target="_blank" className={linkClass}>Terms of Service</a> and{" "}
            <a href="/privacy" target="_blank" className={linkClass}>Privacy Policy</a>.
        </p>
    );
}
