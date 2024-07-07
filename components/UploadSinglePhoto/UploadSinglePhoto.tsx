'use client';

import { useState } from 'react';
import { Box, Button, Input, FormControl, Image } from '@chakra-ui/react';
import {getSignedAvatarURL} from "@/actions/getSignedAvatarURL";
import {useToastContext} from "@/components/providers/ToastProvider";

const computeSHA256  = async (file: File) => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

    return hashHex;
}

export default function UploadSinglePhoto() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { showToast } = useToastContext();

    const handleFileChange = (event: any) => {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            setSelectedFile(file);
            setPreview(URL.createObjectURL(file));
        } else {
            showToast('Please select a valid image file', {}, 'error');
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            showToast('Please select a file first', {}, 'error');
            return;
        }

        try {
            setIsLoading(true);

            const checksum = await computeSHA256(selectedFile);
            const signedURLResult = await getSignedAvatarURL(selectedFile.type, selectedFile.size, checksum);

            if (signedURLResult.failure !== undefined) {
                showToast('You must be signed in to upload this image', {}, 'error')
                return;
            }

            const url = signedURLResult.success.url;

            await fetch(url, {
                method: "PUT",
                body: selectedFile,
                headers: {
                    "Content-Type": selectedFile.type,
                },
            });

            setIsLoading(false);
            showToast('Successfully uploaded image', {}, 'success');
            window.location.reload();
        } catch (e) {
            setIsLoading(false);
            console.error(e);
            showToast("Image didn't upload properly. Please try again later", {}, 'error');
        }
    };

    return (
        <Box>
            <FormControl>
                <Input
                    id="file-upload"
                    type="file"
                    accept="image/jpeg, image/png, image/gif, image/webp"
                    onChange={handleFileChange}
                    display="none"
                />
                <Button as="label" htmlFor="file-upload" cursor="pointer" colorScheme='blue'>
                    Choose Image
                </Button>
            </FormControl>
            {preview && <Image src={preview} alt="Image Preview" mt={4} maxWidth="200px" maxHeight="200px" objectFit="contain" />}
            <Button onClick={handleUpload} mt={4} isDisabled={!selectedFile} colorScheme='blue' isLoading={isLoading}>
                Upload Image
            </Button>
        </Box>
    );
}
