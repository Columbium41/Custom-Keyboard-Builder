'use client';

import {useState} from "react";
import {useRouter} from "next/navigation";
import {signIn} from "next-auth/react";
import {useToastContext} from "@/components/providers/ToastProvider";
import Link from "next/link";
import {Button} from "@chakra-ui/react";

export default function SignInPage() {
    const [usernameOrEmail, setUsernameOrEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { showToastPromise } = useToastContext();

    const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setIsLoading(true);

        const signInPromise = new Promise(async (resolve, reject) => {
            const res = await signIn('credentials', {
                redirect: false,
                usernameOrEmail,
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

            setIsLoading(false);
        });

        showToastPromise(signInPromise, {
            loading: 'Signing in...',
            success: 'Successfully signed in',
            error: (err) => `${err}`
        });
    };

    return (
        <div className="w-96 h-full flex flex-col align-middle absolute inset-0 m-auto">
            <div className="my-auto px-4 py-5 bg-neutral-800 text-white rounded-3xl">
                <h1 className="text-center font-bold text-2xl mb-3">Sign into your Account</h1>
                <form onSubmit={handleSignIn} className="flex flex-col justify-center mb-4">
                    <div className="mb-3">
                        <label htmlFor="username-or-email-input" className="ml-0.5">Username or Email:</label>
                        <input
                            id="username-or-email-input"
                            type="text"
                            className="border border-neutral-500 bg-transparent px-4 py-2 rounded-xl block w-full"
                            value={usernameOrEmail}
                            placeholder="hello@example.com"
                            onChange={(e) => setUsernameOrEmail(e.target.value)}
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

                    <Button type="submit" colorScheme="cyan" className="mx-auto" isLoading={isLoading} width="auto">
                        Login
                    </Button>
                </form>

                <Link href="/verify_email" className="block text-blue-400 underline underline-offset-2 hover:brightness-75 transition duration-300 mb-1">Re-send email verification</Link>
                <Link href="/password_reset" className="block text-blue-400 underline underline-offset-2 hover:brightness-75 transition duration-300">Forgot your password</Link>
            </div>
        </div>
    )
}
