'use client';

import {useState} from "react";
import {useRouter} from "next/navigation";
import {useToastContext} from "@/components/providers/ToastProvider";
import {useCaptcha} from "@/components/providers/CaptchaProvider";
import GoogleReCAPTCHA from "@/components/GoogleReCAPTCHA/GoogleReCAPTCHA";
import {Button} from "@chakra-ui/react";

export default function SignupPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [username , setUsername] = useState('');
    const router = useRouter();
    const { showToastPromise } = useToastContext();
    const { isCaptchaVerified } = useCaptcha();
    const [isLoading, setIsLoading] = useState(false);

    // submit form
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!isCaptchaVerified) {
            alert('Please verify the captcha');
            return;
        }

        setIsLoading(true);

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

            setIsLoading(false);
        });

        showToastPromise(signUpPromise, {
            loading: 'Creating account...',
            success: 'Successfully created account; please check your email and verify your account.',
            error: (err) => `${err}`
        });
    };

    return (
        <div className="w-80 sm:w-96 h-full flex flex-col align-middle my-3 m-auto">
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
                        <ul className="text-sm mt-1 list-disc list-inside space-y-1">
                            <li>Username must be between 6-30 characters</li>
                            <li>Only alphanumerical characters and spaces</li>
                        </ul>
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
                        <ul className="text-sm mt-1 list-disc list-inside space-y-1">
                            <li>Password must be between 8-40 characters</li>
                            <li>Use a combination of random letters & numbers</li>
                            <li>Make sure your password is unrelated to your personal information</li>
                        </ul>
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

                    <GoogleReCAPTCHA className="mb-3" />

                    <Button type="submit" colorScheme="cyan" className="mx-auto" isLoading={isLoading} width="auto">
                        Sign Up
                    </Button>
                </form>
            </div>
        </div>
    )
}