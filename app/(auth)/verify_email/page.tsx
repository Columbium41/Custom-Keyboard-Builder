'use client';

import {useEffect, useState} from "react";
import {useRouter, useSearchParams} from "next/navigation";
import {useToastContext} from "@/app/providers/ToastProviders";

export default function VerifyEmailPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { showToast } = useToastContext();
    const token = searchParams.get('token');
    const [email, setEmail] = useState('');

    // validate token if present
    useEffect(() => {
        if (token) {
            const validateEmail = async () => {
                const res = await fetch(`/api/auth/verify_email`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ token }),
                });

                const data = await res.json();

                if (res.ok) {
                    showToast(data.message, {}, 'success');
                } else {
                    showToast(data.error, {}, 'error');
                }
            }

            validateEmail().then(() => router.push('/'));
        }
    }, [router, token]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const res = await fetch(`/api/auth/verify_email`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
        });

        const data = await res.json();

        if (res.ok) {
            showToast(data.message, {}, 'success');
        } else {
            showToast(data.error, {}, 'error');
        }
    };

    if (token) {
        return <></>
    } else {
        return (
            <div className="w-96 h-full flex flex-col align-middle absolute inset-0 m-auto">
                <div className="my-auto px-4 py-5 bg-neutral-800 text-white rounded-3xl">
                    <h1 className="text-center font-bold text-2xl mb-3">Re-send Verification Email</h1>
                    <form onSubmit={handleSubmit} className="flex flex-col justify-center">
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

                        <button type="submit" className="bg-blue-700 px-4 py-2 rounded-md mx-auto">
                            Re-send Verification Email
                        </button>
                    </form>
                </div>
            </div>
        );
    }
}
