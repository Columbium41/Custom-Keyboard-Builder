import Header from "@/components/Header/Header";
import {getServerSession, Session} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";
import {Inter} from "next/font/google";
import {Providers} from "@/app/providers";
import "@/app/globals.css";

const inter = Inter({ subsets: ["latin"] });

export default async function MainLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const session: Session | null = await getServerSession(authOptions)

    return (
        <html lang="en">
            <body className={inter.className + " h-screen"}>
                <Providers>
                    <Header session={session}></Header>

                    {children}
                </Providers>
            </body>
        </html>
    );
}
