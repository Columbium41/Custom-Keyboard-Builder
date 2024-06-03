'use client';

import {useState, useEffect} from "react";
import {useRouter} from "next/navigation";
import {useSession} from "next-auth/react";
import FormError from "@/components/FormError/FormError";

export default function SignupPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [username , setUsername] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();
    const { data: session } = useSession();

    // check if user is already signed in
    useEffect(() => {
        if (session) {
            router.push('/');
        }
    }, [session, router]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const res = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, email, password, passwordConfirmation }),
        });

        const data = await res.json();
        if (data.error) {
            setError(data.error);
        } else {
            router.push('/api/auth/signin')
        }
    };

    return (
        <div className="w-96 h-full mx-auto flex flex-col align-middle">
            <div className="my-auto px-4 py-5 bg-neutral-800 text-white rounded-3xl">
                { error &&
                    <FormError message={error} />
                }
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
                        <label htmlFor="password-confirmation-input" className="ml-0.5">Password Confirmation:</label>
                        <input
                            id="password-confirmation-input"
                            type="password"
                            className="border border-neutral-500 bg-transparent px-4 py-2 rounded-xl block w-full"
                            value={passwordConfirmation}
                            onChange={(e) => setPasswordConfirmation(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="bg-blue-700 w-28 px-4 py-2 rounded-md mx-auto">
                        Sign Up
                    </button>
                </form>
            </div>
        </div>
    )
}