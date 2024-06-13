'use client';

import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {signIn, useSession} from "next-auth/react";
import {useToastContext} from "@/app/providers/ToastProviders";
import Link from "next/link";

export default function SignInPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();
    const { data: session, status } = useSession();
    const { showToastPromise } = useToastContext();

    // check if user is already signed in
    useEffect(() => {
        if (status === 'authenticated') {
            router.push('/');
        }
    }, [status]);

    const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const signInPromise = new Promise(async (resolve, reject) => {
            const res = await signIn('credentials', {
                redirect: false,
                email,
                password,
            });

            if (res?.error) {
                reject(res?.error);
            } else if (res) {
                resolve('');
                router.push('/');
            } else {
                reject("Unknown Error");
            }
        });

        showToastPromise(signInPromise, {
            loading: 'Signing in...',
            success: 'Successfully signed in',
            error: (err) => `${err}`
        });
    };

    if (status === 'loading' || status === 'authenticated') {
        return <></>
    } else {
        return (
            <div className="w-96 h-full flex flex-col align-middle absolute inset-0 m-auto">
                <div className="my-auto px-4 py-5 bg-neutral-800 text-white rounded-3xl">
                    <h1 className="text-center font-bold text-2xl mb-3">Sign into your Account</h1>
                    <form onSubmit={handleSignIn} className="flex flex-col justify-center mb-4">
                        <div className="mb-3">
                            <label htmlFor="email-input" className="ml-0.5">Email:</label>
                            <input
                                id="email-input"
                                type="email"
                                className="border border-neutral-500 bg-transparent px-4 py-2 rounded-xl block w-full"
                                value={email}
                                placeholder="hello@example.com"
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="password-input" className="ml-0.5">Password:</label>
                            <input
                                id="password-input"
                                type="password"
                                className="border border-neutral-500 bg-transparent px-4 py-2 rounded-xl block w-full"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button type="submit" className="bg-blue-700 px-4 py-2 rounded-md mx-auto">
                            Login
                        </button>
                    </form>

                    <Link href="/verify_email" className="text-blue-400 underline underline-offset-2 hover:brightness-75 transition duration-300">Re-send Email Verification</Link>
                </div>
            </div>
        )
    }
}
