'use client';

import {useState} from "react";
import {useRouter} from "next/navigation";
import {useSession} from "next-auth/react";
import {useToastContext} from "@/components/providers/ToastProvider";
import {Button} from "@chakra-ui/react";
import {AgreementNotice} from "@/components/LegalPage/LegalPage";

// shown to oauth users until they choose a username (enforced in middleware.ts)
export default function CompleteProfilePage() {
    const [username, setUsername] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { update } = useSession();
    const { showToastPromise } = useToastContext();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setIsLoading(true);

        const completeProfilePromise = new Promise(async (resolve, reject) => {
            const res = await fetch('/api/users/complete_profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username }),
            });

            const data = await res.json();

            if (data.error) {
                reject(data.error);
            } else {
                // reload the username into the session token
                await update();
                resolve('');
                router.replace('/');
                router.refresh();
            }

            setIsLoading(false);
        });

        showToastPromise(completeProfilePromise, {
            loading: 'Saving username...',
            success: 'Welcome to MechForum!',
            error: (err) => `${err}`
        });
    };

    return (
        <div className="flex-1 flex items-center">
            <div className="w-80 sm:w-96 h-full flex flex-col align-middle my-3 m-auto">
                <div className="my-auto px-4 py-5 bg-neutral-800 text-white rounded-3xl">
                    <h1 className="text-center font-bold text-2xl mb-3">Choose a Username</h1>
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

                        <Button type="submit" colorScheme="cyan" className="mx-auto" isLoading={isLoading} width="auto">
                            Continue
                        </Button>
                    </form>
                    <AgreementNotice action="continuing" className="mt-3" />
                </div>
            </div>
        </div>
    )
}
