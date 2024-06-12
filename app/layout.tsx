import {Inter} from "next/font/google";
import {SessionProviders} from "@/app/providers/SessionProviders";
import "@/app/globals.css";
import {Toaster} from "react-hot-toast";
import {ToastProvider} from "@/app/providers/ToastProviders";
import {getServerSession, Session} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";
import Header from "@/components/Header/Header";

import type {Metadata} from "next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Custom Keyboard Builder",
    description: "A web application that allows users to build their own custom keyboards and share them with other people",
};

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const session: Session | null = await getServerSession(authOptions)

    return (
        <html lang="en">
            <body className={inter.className + " h-screen"}>
                <SessionProviders>
                    <ToastProvider>
                        <Header session={session} />

                        {children}

                        <Toaster/>
                    </ToastProvider>
                </SessionProviders>
            </body>
        </html>
    );
}
