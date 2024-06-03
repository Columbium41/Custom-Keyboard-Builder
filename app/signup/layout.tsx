import {Inter} from "next/font/google";
import {Providers} from "@/app/providers";

import "@/app/globals.css";

const inter = Inter({ subsets: ["latin"] });

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className + " h-screen"}>
          <Providers>
              {children}
          </Providers>
      </body>
    </html>
  )
}
