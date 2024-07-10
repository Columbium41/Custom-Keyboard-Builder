import {Inter} from "next/font/google";
import "@/app/globals.css";
import {Toaster} from "react-hot-toast";
import Header from "@/components/Header/Header";
import type {Metadata} from "next";
import Providers from "@/components/providers/Providers";

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
            <body className={inter.className + " min-h-screen flex flex-col"}>
                <Providers>
                    <Header />

                    {children}

                    <Toaster/>
                </Providers>
            </body>
        </html>
    );
}
