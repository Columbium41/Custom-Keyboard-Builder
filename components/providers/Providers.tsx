'use client';

import {ChakraProviders} from "@/components/providers/ChakraProviders";
import {SessionProviders} from "@/components/providers/SessionProviders";
import {ToastProvider} from "@/components/providers/ToastProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ChakraProviders>
            <SessionProviders>
                <ToastProvider>
                    { children }
                </ToastProvider>
            </SessionProviders>
        </ChakraProviders>
    );
}