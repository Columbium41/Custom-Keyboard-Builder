import "@/app/globals.css";
import {getServerSession} from "next-auth";
import Redirect from "@/components/Redirect/Redirect";
import {CaptchaProvider} from "@/components/providers/CaptchaProvider";

export default async function AuthLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    // ensure only signed out users can access pages in (auth)
    const session = await getServerSession();

    if (session === null) {
        return (
            <div className="flex-1 flex items-center">
                <CaptchaProvider>
                    { children }

                </CaptchaProvider>
            </div>
        );
    } else {
        return <Redirect to={'/'} message={'You are already signed in'} />
    }
}
