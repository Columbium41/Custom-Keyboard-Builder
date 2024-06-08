import {Inter} from "next/font/google";
import {SessionProviders} from "@/providers/SessionProviders";
import "@/app/globals.css";
import {Toaster} from "react-hot-toast";
import {ToastProvider} from "@/providers/ToastProviders";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={inter.className + " h-screen"}>
                <SessionProviders>
                    <ToastProvider>
                        {children}

                        <Toaster />
                    </ToastProvider>
                </SessionProviders>
            </body>
        </html>
    );
}
