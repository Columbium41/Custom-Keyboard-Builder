'use client';

import {useEffect, useState} from "react";
import {FormDataType} from "@/app/(main)/builds/new/page";
import {
    Box,
    Button,
    Divider,
    FormControl,
    FormHelperText,
    FormLabel,
    Input,
    Textarea, useColorMode
} from "@chakra-ui/react";
import {useToastContext} from "@/components/providers/ToastProvider";
import {useRouter} from "next/navigation";
import {BuildIF} from "@/lib/build";

export function EditBuildForm({ build }: { build: BuildIF }) {
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

    const [isButtonLoading, setIsButtonLoading] = useState(false);
    const { showToast } = useToastContext();
    const router = useRouter();
    const { colorMode } = useColorMode();

    const handleSubmitForm = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setIsButtonLoading(true);

        // create build
        const res = await fetch('/api/builds/edit', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ...formData, build_id: build.build_id })
        });

        const data = await res.json();
        if (res.ok) {
            const buildId = data.buildId;

            showToast('Successfully updated build', {}, 'success');
            router.push(`/builds/${buildId}`);
        } else {
            showToast(data.error, {}, 'error');
        }

        setIsButtonLoading(false);
    }

    // get build data
    useEffect(() => {
        // set build data
        setFormData({
            title: build.title,
            caseValue: build.case,
            pcb: build.pcb,
            plate: build.plate,
            switches: build.switches,
            keycaps: build.keycaps,
            stabs: build.stabilizers,
            mods: build.mods,
            youtube_link: (build.youtubeLink ? `https://www.youtube.com/watch?v=${build.youtubeLink}` : ""),
        });
    }, [build]);

    return (
        <form onSubmit={handleSubmitForm}>
            <Box className="my-4 p-1 mx-auto" width={['320px', '425px']} display="flex" flexDirection="column"
                 gap={2.5}>
                <h1 className="font-semibold text-center text-2xl">Edit Build</h1>
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
                    Update
                </Button>
            </Box>
        </form>
    )
}