import "@/app/globals.css";
import Navigation from "@/components/Navigation/Navigation";

export default function MainLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div>
            <Navigation />

            { children }
        </div>
    );
}
