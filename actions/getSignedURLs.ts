"use server";

import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/_authOptions";
import {PutObjectCommand, DeleteObjectCommand} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";
import {prisma} from "@/lib/prisma";
import s3 from "@/lib/s3client";

const generateFileName = (bytes = 32) => crypto.randomBytes(bytes).toString("hex");

const acceptedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
];

export async function getSignedAvatarURL(type: string, size: number, checksum: string) {
    const maxFileSize = 1024 * 1024 * 2; // 2MB

    try {
        // check file size and type
        if (!acceptedTypes.includes(type)) {
            return {failure: "Invalid file type"}
        }
        if (size > maxFileSize) {
            return {failure: "Avatar must be under 2MB"}
        }

        // check if user is authenticated before giving access
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return {failure: "User is not authenticated"}
        }

        // put object in s3 bucket
        const filename = generateFileName();
        const putObjectCommand = new PutObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME!,
            Key: filename,
            ContentType: type,
            ContentLength: size,
            ChecksumSHA256: checksum,
            Metadata: {
                // @ts-ignore
                userId: session.user.id,
            }
        });
        const signedURL = await getSignedUrl(s3, putObjectCommand, {
            expiresIn: 60,
        });

        // check if current photo exists in the database
        const photo = await prisma.photo.findUnique({
            where: {
                // @ts-ignore
                userId: Number(session.user.id),
            }
        });

        // delete photo from s3 and database if present
        if (photo) {
            const deleteObjectCommand = new DeleteObjectCommand({
                Bucket: process.env.AWS_BUCKET_NAME!,
                Key: photo.fileURL.split("/").pop()!,
            });
            await s3.send(deleteObjectCommand);

            await prisma.photo.delete({
                where: {
                    // @ts-ignore
                    userId: Number(session.user.id),
                }
            });
        }

        // create metadata in database
        await prisma.photo.create({
           data: {
               // @ts-ignore
               userId: Number(session.user.id),
               filename: filename,
               fileURL: signedURL.split("?")[0],
               mimetype: type,
               size: size,
           }
        });

        return {success: {url: signedURL}}
    } catch (e) {
        console.error(e)
        return { failure: "Unknown error, please try again later" }
    }
}

export async function getSignedBuildPhotoURL(buildId: string, isThumbnail: boolean, type: string, size: number, checksum: string) {
    const maxFileSize = 1024 * 1024 * 5; // 5MB

    try {
        // check file size and type
        if (!acceptedTypes.includes(type)) {
            return {failure: "Invalid file type"}
        }
        if (size > maxFileSize) {
            return {failure: "Avatar must be under 5MB"}
        }

        // check if user is authenticated before giving access
        const session = await getServerSession(authOptions);
        const build = await prisma.build.findUnique({
            where: {
                build_id: buildId
            }
        });

        if (!build || !session || !session.user || build.userId !== Number(session.user.id)) {
            return {failure: "User is not authenticated or does not have the correct permissions"}
        }

        // put object in s3 bucket
        const filename = generateFileName();
        const putObjectCommand = new PutObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME!,
            Key: filename,
            ContentType: type,
            ContentLength: size,
            ChecksumSHA256: checksum,
            Metadata: {
                // @ts-ignore
                userId: session.user.id,
            }
        });
        const signedURL = await getSignedUrl(s3, putObjectCommand, {
            expiresIn: 60,
        });

        // create metadata in database
        await prisma.photo.create({
            data: {
                buildId: buildId,
                filename: filename,
                fileURL: signedURL.split("?")[0],
                mimetype: type,
                size: size,
                isThumbnail: isThumbnail,
            }
        });

        return {success: {url: signedURL}}
    } catch (e) {
        console.error(e)
        return { failure: "Unknown error, please try again later" }
    }
}
