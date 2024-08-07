'use client';

import {Divider, Textarea, Button} from "@chakra-ui/react";
import UploadSinglePhoto from "@/components/UploadSinglePhoto/UploadSinglePhoto";
import {UserIF} from "@/lib/user";
import {Dispatch, SetStateAction, useState} from "react";
import {useToastContext} from "@/components/providers/ToastProvider";

export default function ProfileTab({
    user,
    currentUser,
    setTabIndex
}: {
    user: UserIF,
    currentUser: boolean,
    setTabIndex: Dispatch<SetStateAction<number>>
}) {
    const [descriptionValue, setDescriptionValue] = useState("");
    const [editingDescription, setEditingDescription] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const {showToast} = useToastContext();

    const handleUpdateDescription = async () => {
        setIsLoading(true);

        await fetch("/api/users/update_description", {
            method: "PATCH",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username: user.username, description: descriptionValue }),
        }).then(async (res) => {
            const data = await res.json();
            setIsLoading(false);

            if (res.ok) {
                window.location.reload();
            } else {
                showToast(data.error, {}, 'error')
            }
        });
    }

    return (
        <div className="flex flex-row flex-wrap sm:flex-nowrap text-start gap-3">
            {/* Account details */}
            <div className="w-full sm:w-1/4">
                <h3 className="font-semibold mb-2 text-xl">Completed Builds</h3>
                <Divider className="mb-3" />
                <p className="underline inline-block mb-5 cursor-pointer text-blue-400" onClick={() => setTabIndex(1)}>{ user.builds?.length }</p>

                <h3 className="font-semibold mb-2 text-xl">Created</h3>
                <Divider className="mb-3" />
                <p>{ user.createdAt.toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) }</p>
            </div>

            {/* Profile */}
            <div className="w-full sm:w-3/4">
                {/* User Description */}
                <div className="mb-5">
                    <h3 className="font-semibold mb-2 text-xl">Profile</h3>
                    <Divider className="mb-3" />
                    { !editingDescription && (
                        <div className="whitespace-pre-wrap">
                            {!user.description ? "This user hasn't entered a profile description" : user.description}
                        </div>
                    )}
                    {currentUser && !editingDescription && (
                        <Button colorScheme='blue' className="mt-3" onClick={() => setEditingDescription(true)}>
                            Edit Description
                        </Button>
                    )}
                    { currentUser && editingDescription && (
                        <div>
                            <Textarea
                                value={descriptionValue}
                                onChange={(e) => setDescriptionValue(e.target.value)}
                                className="mb-2"
                                isInvalid={descriptionValue.length > 1000 || descriptionValue.split('\n').length > 15 }
                                placeholder={"enter a description"}
                                resize="none"
                                height={120}
                            />
                            <div className="flex flex-row mb-2 justify-between">
                                <p>{descriptionValue.split('\n').length + '/15 lines'}</p>
                                <p>{descriptionValue.length + '/1000 characters'}</p>
                            </div>

                            <Button colorScheme='cyan' onClick={() => handleUpdateDescription()} className="mr-2"
                                    isLoading={isLoading}>
                                Save
                            </Button>
                            <Button colorScheme='cyan' variant='outline' onClick={() => setEditingDescription(false)}>
                                Cancel
                            </Button>
                        </div>
                    )}
                </div>

                {/* Avatar */}
                { currentUser &&
                    (<div>
                        <h3 className="font-semibold mb-2 text-xl">Change Avatar</h3>
                        <Divider className="mb-3" />
                        <UploadSinglePhoto />
                    </div>)
                }
            </div>
        </div>
    )
}

