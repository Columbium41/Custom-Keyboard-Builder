import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import {Providers} from "@/app/providers";

import Header from "@/components/Header/Header";
import {getServerSession, Session} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";

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
          <Providers>
              <Header session={session}></Header>

              {children}
          </Providers>
      </body>
    </html>
  );
}
