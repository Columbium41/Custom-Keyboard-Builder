'use client';

import {useState} from "react";
import {useRouter} from "next/navigation";
import {useToastContext} from "@/components/providers/ToastProvider";
import {useCaptcha} from "@/components/providers/CaptchaProvider";
import GoogleReCAPTCHA from "@/components/GoogleReCAPTCHA/GoogleReCAPTCHA";

export default function SignupPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [username , setUsername] = useState('');
    const router = useRouter();
    const { showToastPromise } = useToastContext();
    const { isCaptchaVerified } = useCaptcha();
    const [usernameLength, setUsernameLength] = useState(false);
    const [usernameSpecialChar, setUsernameSpecialChar] = useState(false);
    const [passwordLength, setPasswordLength] = useState(false);

    const handleUsernameChange = (value: string) => {
        if (value.length < 6 || value.length > 30) {
            setUsernameLength(true);
        } else {
            setUsernameLength(false)
        }

        if (value.includes('@')) {
            setUsernameSpecialChar(true);
        } else {
            setUsernameSpecialChar(false);
        }

        setUsername(value);
    }

    const handlePasswordChange = (value: string) => {
        if (value.length < 8 || value.length > 40) {
            setPasswordLength(true);
        } else {
            setPasswordLength(false);
        }

        setPassword(value);
    }

    // submit form
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!isCaptchaVerified) {
            alert('Please verify the captcha');
            return;
        }

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
                            onChange={(e) => handleUsernameChange(e.target.value)}
                            required
                        />
                        <ul>
                            <li className={"text-red-500 " + (usernameLength ? "" : "hidden")}>Username must be between 6-30 characters</li>
                            <li className={"text-red-500 " + (usernameSpecialChar ? "" : "hidden")}>Username cannot contain the character &apos;@&apos;</li>
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
                            onChange={(e) => handlePasswordChange(e.target.value)}
                            required
                        />
                        <ul>
                            <li className={"text-red-500 " + (passwordLength ? "" : "hidden")}>Password must be between 8-40 characters</li>
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

                    <button type="submit" className="bg-blue-700 px-4 py-2 rounded-md mx-auto">
                        Sign Up
                    </button>
                </form>
            </div>
        </div>
    )
}