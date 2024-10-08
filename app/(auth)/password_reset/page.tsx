'use client';

import {useEffect, useState} from "react";
import {useRouter, useSearchParams} from "next/navigation";
import {useToastContext} from "@/components/providers/ToastProvider";
import GoogleReCAPTCHA from "@/components/GoogleReCAPTCHA/GoogleReCAPTCHA";
import {useCaptcha} from "@/components/providers/CaptchaProvider";
import {toast} from "react-hot-toast";
import {Button, Spinner} from "@chakra-ui/react";

export default function PasswordResetPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { showToast } = useToastContext();
    const token = searchParams.get('token');
    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [tokenValid, setTokenValid] = useState<boolean | null>(null);
    const { isCaptchaVerified } = useCaptcha();
    const [isLoading, setIsLoading] = useState(false);

    // validate URL token if present
    useEffect(() => {
        if (token) {
            const validateToken = async () => {
                const res = await fetch(`/api/auth/password_reset`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ token }),
                });

                const data = await res.json();

                if (res.ok) {
                    setTokenValid(true);
                } else {
                    showToast(data.error, {}, 'error');
                    setTokenValid(false);
                }
            }

            validateToken();
        } else {
            setTokenValid(false);
        }
    }, [token]);

    // send password reset email
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!isCaptchaVerified) {
            alert('Please verify the captcha');
            return;
        }

        setIsLoading(true);
        const loadingToast = toast.loading('Sending password reset email...');

        const res = await fetch(`/api/auth/send_password_reset`, {
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

    // change password
    const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setIsLoading(true);
        const loadingToast = toast.loading('Changing password...');

        const res = await fetch(`/api/auth/password_reset`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token, newPassword, passwordConfirmation }),
        });

        const data = await res.json();

        toast.dismiss(loadingToast);
        if (res.ok) {
            showToast(data.message, {}, 'success');
            router.push('/signin');
        } else {
            showToast(data.error, {}, 'error');
        }

        setIsLoading(false);
    }

    if (tokenValid === null) {
        return (<Spinner
            thickness='4px'
            emptyColor='gray.200'
            color='orange.500'
            className="!w-28 !h-28 absolute inset-0 m-auto"
        />)
    } else if (!tokenValid) {
        return (
            <div className="w-80 sm:w-96 max-w-screen h-full flex flex-col align-middle m-auto">
                <div className="my-auto px-4 py-5 bg-neutral-800 text-white rounded-3xl">
                    <h1 className="text-center font-bold text-2xl mb-3">Reset your Password</h1>
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
                            Submit
                        </Button>
                    </form>
                </div>
            </div>
        );
    } else {
        return (
            <div className="w-80 sm:w-96 max-w-screen h-full flex flex-col align-middle m-auto">
                <div className="my-auto px-4 py-5 bg-neutral-800 text-white rounded-3xl">
                    <h1 className="text-center font-bold text-2xl mb-3">Change your password</h1>
                    <form onSubmit={handleChangePassword} className="flex flex-col justify-center">
                        <div className="mb-3">
                            <label htmlFor="email-input" className="ml-0.5">New Password:</label>
                            <input
                                id="new-password-input"
                                type="password"
                                className="border border-neutral-500 bg-transparent px-4 py-2 rounded-xl block w-full"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="email-input" className="ml-0.5">Confirm Password:</label>
                            <input
                                id="password-confirmation-input"
                                type="password"
                                className="border border-neutral-500 bg-transparent px-4 py-2 rounded-xl block w-full"
                                value={passwordConfirmation}
                                onChange={(e) => setPasswordConfirmation(e.target.value)}
                                required
                            />
                        </div>

                        <Button type="submit" colorScheme="cyan" className="mx-auto" isLoading={isLoading} width="auto">
                            Change Password
                        </Button>
                    </form>
                </div>
            </div>
        )
    }
}
