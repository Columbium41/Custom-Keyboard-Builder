import Header from "@/components/Header/Header";
import {getServerSession, Session} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";
import "@/app/globals.css";

export default async function MainLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const session: Session | null = await getServerSession(authOptions)

    return (
        <div>
            <Header session={session}></Header>

            { children }
        </div>
    );
}
