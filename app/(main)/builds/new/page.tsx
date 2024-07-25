'use client';

import {
    Box,
    Button, Divider,
    FormControl,
    FormHelperText,
    FormLabel,
    IconButton,
    Image,
    Input,
    Textarea, useColorMode
} from "@chakra-ui/react";
import {useState} from "react";
import {useToastContext} from "@/components/providers/ToastProvider";
import {SmallCloseIcon} from "@chakra-ui/icons";
import {getSignedBuildPhotoURL} from "@/actions/getSignedURLs";
import {computeSHA256} from "@/components/UploadSinglePhoto/UploadSinglePhoto";
import {useRouter} from "next/navigation";

type FormDataType = {
    title: string,
    caseValue: string,
    pcb: string,
    plate: string,
    switches: string,
    keycaps: string,
    stabs: string,
    mods: string,
    youtube_link: string,
}

async function createPhoto(photo: File, isThumbnail: boolean, buildId: string) {
    const checksum = await computeSHA256(photo);
    const signedURLResult = await getSignedBuildPhotoURL(buildId, isThumbnail, photo.type, photo.size, checksum);

    // error when creating thumbnail
    if (signedURLResult.failure !== undefined) {
        throw new Error('Error when creating photos, please try again later');
    }

    const thumbnailURL = signedURLResult.success.url;
    await fetch(thumbnailURL, {
        method: "PUT",
        body: photo,
        headers: {
            "Content-Type": photo.type,
        },
    });
}

export default function BuildPage() {
    const [formData, setFormData] = useState<FormDataType>({
        title: "",
        caseValue: "",
        pcb: "",
        plate: "",
        switches: "",
        keycaps: "",
        stabs: "",
        mods: "",
        youtube_link: "",
    });

    const [thumbnail, setThumbnail] = useState<File | null>(null);
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

    const [photos, setPhotos] = useState<File[]>([]);
    const [photosPreview, setPhotosPreview] = useState<string[]>([]);

    const [isButtonLoading, setIsButtonLoading] = useState(false);
    const { showToast } = useToastContext();
    const router = useRouter();
    const { colorMode } = useColorMode();

    const handleThumbnailChange = (event: any) => {
        const file = event.target.files[0];

        if (file && file.type.startsWith('image/') && file.size <= 1024 * 1024 * 5) {
            setThumbnail(file);
            setThumbnailPreview(URL.createObjectURL(file));
        } else {
            showToast('Please select a valid image file', {}, 'error');
        }
    };

    const handlePhotoChange = (event: any) => {
        const newFile = event.target.files[event.target.files.length - 1];

        if (photos.length >= 4) {
            showToast('Too many photos', {}, 'error');
        } else if (newFile && newFile.type.startsWith('image/') && newFile.size <= 1024 * 1024 * 5) {
            const newFilePreview = URL.createObjectURL(newFile);

            setPhotos((photos) => ([...photos, newFile]));
            setPhotosPreview((photosPreview) => ([...photosPreview, newFilePreview]));
        } else {
            showToast('Please select a valid image file', {}, 'error');
        }
    };

    const handlePhotoRemove = (index: number) => {
        setPhotos(photos.filter((_, idx) => idx !== index));
        setPhotosPreview(photosPreview.filter((_, idx) => idx !== index));
    }

    const handleSubmitForm = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setIsButtonLoading(true);

        if (!thumbnail) {
            showToast('Thumbnail not present', {}, 'error');
            return;
        }
        if (photos && photos.length > 4) {
            showToast('You have too many photos', {}, 'error');
            return;
        }

        // create build
        const res = await fetch('/api/builds/new', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        const data = await res.json();
        if (res.ok) {
            const buildId = data.buildId;

            // create thumbnail
            await createPhoto(thumbnail, true, buildId);

            // create photos
            for (let i = 0; i < photos.length; i++) {
                const photo = photos[i];
                await createPhoto(photo, false, buildId);
            }

            showToast('Successfully created build', {}, 'success');
            router.push('/');
        } else {
            showToast(data.error, {}, 'error');
        }

        setIsButtonLoading(false);
    }

    return (
        <form onSubmit={handleSubmitForm}>
            <Box className="my-4 p-1 mx-auto" width={['320px', '425px']} display="flex" flexDirection="column"
                 gap={2.5}>
                <h1 className="font-semibold text-center text-2xl">Create a Build</h1>
                <Divider orientation="horizontal" mb={1}/>

                <FormControl id="title-input" isRequired>
                    <FormLabel mb={0.5} htmlFor="title-input">Title</FormLabel>
                    <Input
                        type="text"
                        value={formData.title}
                        name="title-input"
                        className={(colorMode === 'light' ? '!border-neutral-700' : '!border-neutral-400')}
                        isInvalid={formData.title.length > 255}
                        onChange={(e) => setFormData((formData) => ({...formData, title: e.target.value}))}
                    />
                </FormControl>

                <FormControl id="thumbnail-input" isRequired>
                    <FormLabel mb={0.5}>Thumbnail</FormLabel>
                    <Input
                        type="file"
                        accept="image/jpeg, image/png, image/gif, image/webp"
                        display="none"
                        onChange={handleThumbnailChange}
                        name="thumbnail-input"
                    />
                    <Button as="label" htmlFor="thumbnail-input" cursor="pointer" colorScheme='blue'>
                        Choose Image
                    </Button>
                    <FormHelperText className="!text-inherit">Max File Size: 5MB</FormHelperText>
                    {thumbnailPreview &&
                        (<Image
                            src={thumbnailPreview}
                            alt="Thumbnail Preview"
                            maxWidth="150px"
                            maxHeight="150px"
                            objectFit="contain"
                            className="!mx-auto"
                        />)
                    }
                </FormControl>

                <h2 className="font-semibold text-center text-lg">Keyboard Specs</h2>
                <Divider orientation="horizontal" mb={1}/>

                <FormControl id="case-input" isRequired>
                    <FormLabel mb={0.5} htmlFor="case-input">Case / Kit</FormLabel>
                    <Input
                        type="text"
                        value={formData.caseValue}
                        name="case-input"
                        className={(colorMode === 'light' ? '!border-neutral-700' : '!border-neutral-400')}
                        placeholder="e.g. Singa Kohaku R1"
                        isInvalid={formData.caseValue.length > 255}
                        onChange={(e) => setFormData((formData) => ({...formData, caseValue: e.target.value}))}
                    />
                </FormControl>

                <FormControl id="plate-input" isRequired>
                    <FormLabel mb={0.5} htmlFor="plate-input">Plate</FormLabel>
                    <Input
                        type="text"
                        value={formData.plate}
                        name="plate-input"
                        className={(colorMode === 'light' ? '!border-neutral-700' : '!border-neutral-400')}
                        placeholder="e.g. Aluminum"
                        isInvalid={formData.plate.length > 255}
                        onChange={(e) => setFormData((formData) => ({...formData, plate: e.target.value}))}
                    />
                </FormControl>

                <FormControl id="switches-input" isRequired>
                    <FormLabel mb={0.5} htmlFor="switches-input">Switches</FormLabel>
                    <Input
                        type="text"
                        value={formData.switches}
                        name="switches-input"
                        className={(colorMode === 'light' ? '!border-neutral-700' : '!border-neutral-400')}
                        placeholder="e.g. Cherry MX Browns"
                        isInvalid={formData.switches.length > 255}
                        onChange={(e) => setFormData((formData) => ({...formData, switches: e.target.value}))}
                    />
                </FormControl>

                <FormControl id="keycaps-input" isRequired>
                    <FormLabel mb={0.5} htmlFor="keycaps-input">Keycaps</FormLabel>
                    <Input
                        type="text"
                        value={formData.keycaps}
                        name="keycaps-input"
                        className={(colorMode === 'light' ? '!border-neutral-700' : '!border-neutral-400')}
                        placeholder="e.g. GMK Striker"
                        isInvalid={formData.keycaps.length > 255}
                        onChange={(e) => setFormData((formData) => ({...formData, keycaps: e.target.value}))}
                    />
                </FormControl>

                <FormControl id="pcb-input">
                    <FormLabel mb={0.5} htmlFor="pcb-input">PCB</FormLabel>
                    <Input
                        type="text"
                        value={formData.pcb}
                        name="pcb-input"
                        className={(colorMode === 'light' ? '!border-neutral-700' : '!border-neutral-400')}
                        isInvalid={formData.pcb.length > 255}
                        onChange={(e) => setFormData((formData) => ({...formData, pcb: e.target.value}))}
                    />
                </FormControl>

                <FormControl id="stabs-input">
                    <FormLabel mb={0.5} htmlFor="stabs-input">Stabilizers</FormLabel>
                    <Input
                        type="text"
                        value={formData.stabs}
                        name="stabs-input"
                        className={(colorMode === 'light' ? '!border-neutral-700' : '!border-neutral-400')}
                        isInvalid={formData.stabs.length > 255}
                        onChange={(e) => setFormData((formData) => ({...formData, stabs: e.target.value}))}
                    />
                </FormControl>

                <h2 className="font-semibold text-center text-lg">Additional Info</h2>
                <Divider orientation="horizontal" mb={1}/>

                <FormControl id="mods-input">
                    <FormLabel mb={0.5} htmlFor="mods-input">Description / Mods</FormLabel>
                    <Textarea
                        placeholder="e.g. 20 layer tape mod..."
                        resize="none"
                        height={120}
                        paddingX={2}
                        isInvalid={formData.mods.length > 1000 || formData.mods.split('\n').length > 15}
                        value={formData.mods}
                        name="mods-input"
                        className={(colorMode === 'light' ? '!border-neutral-700' : '!border-neutral-400')}
                        onChange={(e) => setFormData((formData) => ({...formData, mods: e.target.value}))}
                    />
                    <Box display="flex" flexDirection="row" justifyContent="space-between">
                        <FormHelperText
                            className="!text-inherit">{formData.mods.split('\n').length + '/15 lines'}</FormHelperText>
                        <FormHelperText
                            className="!text-inherit">{formData.mods.length + '/1000 characters'}</FormHelperText>
                    </Box>
                </FormControl>

                <FormControl id="photos-input">
                    <FormLabel mb={0.5} htmlFor="photos-input">Additional Photos (up to 4)</FormLabel>
                    <Input
                        type="file"
                        accept="image/jpeg, image/png, image/gif, image/webp"
                        display="none"
                        name="photos-input"
                        onChange={handlePhotoChange}
                    />
                    <Button as="label" htmlFor="photos-input" cursor="pointer" colorScheme='blue'>
                        Choose Images
                    </Button>
                    <FormHelperText className="!text-inherit">Max File Size: 5MB (each)</FormHelperText>
                    <div className="w-full flex flex-row flex-wrap justify-start gap-3 mt-4">
                        {photosPreview.length > 0 && photosPreview.map((photo, index) => (
                            <div key={index} className="relative inline-block">
                                <Image
                                    src={photo}
                                    alt={`Image #${index} Preview`}
                                    maxWidth="100px"
                                    maxHeight="100px"
                                    objectFit="contain"
                                />
                                <IconButton
                                    icon={<SmallCloseIcon/>}
                                    size="xs"
                                    position="absolute"
                                    top="-2"
                                    right="-2"
                                    aria-label={`remove-#${index}`}
                                    bg={"red.400"}
                                    _hover={{bg: "red.500"}}
                                    onClick={() => handlePhotoRemove(index)}
                                />
                            </div>
                        ))}
                    </div>
                </FormControl>

                <FormControl id="youtube-link-input">
                    <FormLabel mb={0.5} htmlFor="youtube-link-input">Youtube Link</FormLabel>
                    <Input
                        type="text"
                        value={formData.youtube_link}
                        name="youtube-link-input"
                        className={(colorMode === 'light' ? '!border-neutral-700' : '!border-neutral-400')}
                        isInvalid={formData.youtube_link.length > 255}
                        onChange={(e) => setFormData((formData) => ({...formData, youtube_link: e.target.value}))}
                    />
                </FormControl>

                <Button
                    type="submit"
                    colorScheme="blue"
                    mt={3}
                    width={"auto"}
                    className="!mx-auto"
                    isLoading={isButtonLoading}
                >
                    Create
                </Button>
            </Box>
        </form>
    )
}
