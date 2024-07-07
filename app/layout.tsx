import {Inter} from "next/font/google";
import {SessionProviders} from "@/components/providers/SessionProviders";
import "@/app/globals.css";
import {Toaster} from "react-hot-toast";
import {ToastProvider} from "@/components/providers/ToastProvider";
import Header from "@/components/Header/Header";

import type {Metadata} from "next";
import {ChakraProvider} from "@chakra-ui/react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "MechForum",
    description: "A web application that allows users to build their own custom keyboards and share them with other people",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <head>
                <script src="https://www.google.com/recaptcha/enterprise.js" async defer></script>
            </head>
            <body className={inter.className + " min-h-screen flex flex-col bg-neutral-700"}>
                <ChakraProvider>
                    <SessionProviders>
                        <ToastProvider>
                            <Header />

                            {children}

                            <Toaster/>
                        </ToastProvider>
                    </SessionProviders>
                </ChakraProvider>
            </body>
        </html>
    );
}
