'use client';

import {useState} from "react";
import {useRouter} from "next/navigation";
import {useToastContext} from "@/app/providers/ToastProviders";

export default function SignupPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [username , setUsername] = useState('');
    const router = useRouter();
    const { showToastPromise } = useToastContext();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const signUpPromise = new Promise(async (resolve, reject) => {
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, password, passwordConfirmation }),
            });

            const data = await res.json();

            if (data.error) {
                reject(data.error);
            } else {
                router.push('/');
                resolve('');
            }
        });

        showToastPromise(signUpPromise, {
            loading: 'Creating account...',
            success: 'Successfully created account; please check your email and verify your account.',
            error: (err) => `${err}`
        });
    };

    return (
        <div className="w-96 h-full flex flex-col align-middle absolute inset-0 m-auto">
            <div className="my-auto px-4 py-5 bg-neutral-800 text-white rounded-3xl">
                <h1 className="text-center font-bold text-2xl mb-3">Create an Account</h1>
                <form onSubmit={handleSubmit} className="flex flex-col justify-center">
                    <div className="mb-3">
                        <label htmlFor="username-input" className="ml-0.5">Username:</label>
                        <input
                            id="username-input"
                            type="text"
                            className="border border-neutral-500 bg-transparent px-4 py-2 rounded-xl block w-full"
                            value={username}
                            placeholder="John Doe"
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
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
                    <div className="mb-3">
                        <label htmlFor="password-confirmation-input" className="ml-0.5">Password
                            Confirmation:</label>
                        <input
                            id="password-confirmation-input"
                            type="password"
                            className="border border-neutral-500 bg-transparent px-4 py-2 rounded-xl block w-full"
                            value={passwordConfirmation}
                            onChange={(e) => setPasswordConfirmation(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="bg-blue-700 px-4 py-2 rounded-md mx-auto">
                        Sign Up
                    </button>
                </form>
            </div>
        </div>
    )
}