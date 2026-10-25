'use client';

import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
    Button,
    Divider,
    Input
} from "@chakra-ui/react";
import {useDisclosure} from "@chakra-ui/hooks";
import {useRef, useState} from "react";
import {signOut} from "next-auth/react";
import {useToastContext} from "@/components/providers/ToastProvider";

// owner only, the user types their username to confirm
export default function DeleteAccount({ username }: { username: string }) {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const cancelRef = useRef<HTMLButtonElement>(null);
    const [confirmation, setConfirmation] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { showToast } = useToastContext();

    const handleClose = () => {
        setConfirmation("");
        onClose();
    };

    const handleDelete = async () => {
        setIsLoading(true);

        const res = await fetch("/api/users/delete_account", {
            method: "DELETE",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username: confirmation }),
        });
        const data = await res.json();

        if (res.ok) {
            showToast("Your account has been deleted", {}, 'success');
            // the session token outlives the account, so sign out
            await signOut({ callbackUrl: "/" });
        } else {
            showToast(data.error, {}, 'error');
            setIsLoading(false);
        }
    };

    return (
        <div className="mt-5">
            <h3 className="font-semibold mb-2 text-xl">Delete Account</h3>
            <Divider className="mb-3" />
            <p className="mb-3">
                Permanently deletes your account, builds, photos, likes and comments. This can&apos;t be undone.
            </p>
            <Button colorScheme='red' variant='outline' onClick={onOpen}>
                Delete Account
            </Button>

            <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={handleClose}>
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader fontSize='lg' fontWeight='bold' borderTopRadius='md'>
                            Delete Account
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            <label htmlFor="delete-account-confirmation">
                                Type <strong>{username}</strong> to permanently delete your account and everything you&apos;ve posted.
                            </label>
                            <Input
                                id="delete-account-confirmation"
                                className="mt-3"
                                value={confirmation}
                                onChange={(e) => setConfirmation(e.target.value)}
                                autoComplete="off"
                            />
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={handleClose}>
                                Cancel
                            </Button>
                            <Button
                                colorScheme='red'
                                onClick={handleDelete}
                                isDisabled={confirmation !== username}
                                isLoading={isLoading}
                                ml={3}
                            >
                                Delete Forever
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </div>
    );
}
