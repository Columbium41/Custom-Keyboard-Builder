'use client';

import {useEffect} from "react";
import {useRouter} from "next/navigation";
import {useToastContext} from "@/app/providers/ToastProviders";

export default function Redirect({ to, message }: { to: string, message: string }) {
    const router = useRouter();
    const {showToast} = useToastContext();

    useEffect(() => {
        showToast(message, {}, 'error');
        router.push(to);
    }, []);

    return null;
}
