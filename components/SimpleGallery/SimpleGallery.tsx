'use client';

import React, {useEffect, useState} from 'react';
import PhotoSwipeLightbox from 'photoswipe/lightbox';
import 'photoswipe/style.css';
import {Photo} from "@prisma/client";
import Image from "next/image";
import {Grid} from "@chakra-ui/react";
import {getImageDimensions} from "@/lib/build";

export default function SimpleGallery({ galleryID, images }: { galleryID: string, images: Photo[] }) {
    const [imageDimensions, setImageDimensions] = useState<{ width: number, height: number }[]>([]);

    useEffect(() => {
        const fetchDimensions = async () => {
            const dimensions = await Promise.all(images.map(async (image) => {
                const { width, height } = await getImageDimensions(image.fileURL);
                return { width, height };
            }));
            setImageDimensions(dimensions);
        };

        fetchDimensions().then(() => {
            let lightbox: PhotoSwipeLightbox | null = new PhotoSwipeLightbox({
                gallery: '#' + galleryID,
                children: 'a',
                pswpModule: () => import('photoswipe'),
            });
            lightbox.init();

            return () => {
                if (lightbox) {
                    lightbox.destroy();
                    lightbox = null;
                }
            };
        });
    }, [galleryID, images]);

    return (
        <Grid
            templateColumns="repeat(5, 1fr)"
            gap={1}
            className="pswp-gallery"
            id={galleryID}
            paddingX={6}
            paddingY={3}
        >
            {images.map((image, index) => (
                <a
                    href={image.fileURL}
                    data-pswp-width={imageDimensions[index]?.width}
                    data-pswp-height={imageDimensions[index]?.height}
                    key={galleryID + '-' + index}
                    target="_blank"
                    rel="noreferrer"
                >
                    <Image
                        src={image.fileURL}
                        alt=""
                        layout="responsive"
                        width={100}
                        height={100}
                    />
                </a>
            ))}
        </Grid>
    );
}
