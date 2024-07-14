'use client';

import {Divider, Textarea, Button} from "@chakra-ui/react";
import UploadSinglePhoto from "@/components/UploadSinglePhoto/UploadSinglePhoto";
import {UserIF} from "@/lib/user";
import {useState} from "react";
import {useToastContext} from "@/components/providers/ToastProvider";

export default function ProfileTab({ user, currentUser }: { user: UserIF, currentUser: boolean }) {
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
                {/* TODO: change to link */}
                <p className="mb-5">{ user.builds?.length }</p>

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
                        <div>
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
                                isInvalid={descriptionValue.length > 1000}
                                placeholder={"enter a description"}
                            />
                            <p className="mb-2">{ descriptionValue.length + '/1000' }</p>

                            <Button colorScheme='cyan' onClick={() => handleUpdateDescription()} className="mr-2" isLoading={isLoading}>
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

