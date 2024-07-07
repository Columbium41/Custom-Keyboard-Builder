'use client';

import {useEffect, useState} from "react";
import {useRouter, useSearchParams} from "next/navigation";
import {useToastContext} from "@/components/providers/ToastProvider";
import GoogleReCAPTCHA from "@/components/GoogleReCAPTCHA/GoogleReCAPTCHA";
import {useCaptcha} from "@/components/providers/CaptchaProvider";
import {toast} from "react-hot-toast";
import {Button} from "@chakra-ui/react";

export default function VerifyEmailPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { showToast } = useToastContext();
    const token = searchParams.get('token');
    const [email, setEmail] = useState('');
    const { isCaptchaVerified } = useCaptcha();
    const [isLoading, setIsLoading] = useState(false);

    // validate token if present
    useEffect(() => {
        if (token) {
            const validateEmail = async () => {
                const res = await fetch(`/api/auth/verify_email`, {
                    method: 'POST',
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

            validateEmail().then(() => router.push('/signin'));
        }
    }, [router, token]);

    // re-send email verification
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!isCaptchaVerified) {
            alert('Please verify the captcha');
            return;
        }

        setIsLoading(true);
        const loadingToast = toast.loading('Sending password reset email...');

        const res = await fetch(`/api/auth/send_email_verification`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
        });

        const data = await res.json();

        toast.dismiss(loadingToast);
        if (res.ok) {
            showToast(data.message, {}, 'success');
        } else {
            showToast(data.error, {}, 'error');
        }

        setIsLoading(false);
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

                        <GoogleReCAPTCHA className="mb-3" />

                        <Button type="submit" colorScheme="cyan" className="mx-auto" isLoading={isLoading} width="auto">
                            Re-send Verification Email
                        </Button>
                    </form>
                </div>
            </div>
        );
    }
}
