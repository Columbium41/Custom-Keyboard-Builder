import "@/app/globals.css";

export default async function MainLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="h-full">
            { children }
        </div>
    );
}
