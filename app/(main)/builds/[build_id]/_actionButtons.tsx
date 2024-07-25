'use client';

import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogContent, AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
    Button
} from "@chakra-ui/react";
import {DeleteIcon, EditIcon} from "@chakra-ui/icons";
import {useRouter} from "next/navigation";
import {useDisclosure} from "@chakra-ui/hooks";
import {useRef} from "react";
import {useToastContext} from "@/components/providers/ToastProvider";

export function BuildPageActionButtons({ buildId } : { buildId: string }) {
    const router = useRouter();
    const { isOpen, onOpen, onClose } = useDisclosure()
    const cancelRef = useRef()
    const { showToast } = useToastContext();

    const handleDelete = async () => {
          const res = await fetch('/api/builds/delete', {
              method: "DELETE",
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({ buildId: buildId }),
          });

          if (res.ok) {
              showToast("Successfully deleted build", {}, 'success');
              router.push("/");
          } else {
              const json = await res.json();
              showToast(json.error, {}, 'error');
          }
    };

    return (
        <div className="flex flex-row gap-2 sm:absolute sm:top-2 sm:left-2">
            <Button
                colorScheme="red"
                size="sm"
                leftIcon={<DeleteIcon/>}
                onClick={onOpen}
            >Delete
            </Button>
            <Button
                colorScheme="blue"
                size="sm"
                leftIcon={<EditIcon/>}
                onClick={() => router.push(`/builds/edit/${buildId}`)}
            >Edit
            </Button>

            {/* Delete Alert Dialog */}
            <AlertDialog
                isOpen={isOpen}
                // @ts-ignore
                leastDestructiveRef={cancelRef}
                onClose={onClose}
            >
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader fontSize='lg' fontWeight='bold' borderTopRadius='md'>
                            Delete Build
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            Are you sure you want to permanently delete this build?
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button
                                // @ts-ignore
                                ref={cancelRef}
                                onClick={onClose}
                            >
                                Cancel
                            </Button>
                            <Button colorScheme='red' onClick={handleDelete} ml={3}>
                                Delete
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </div>
    )
}