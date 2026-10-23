"use server";

import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/_authOptions";
import {PutObjectCommand, DeleteObjectCommand, HeadObjectCommand, GetObjectCommand} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";
import {prisma} from "@/lib/prisma";
import s3 from "@/lib/s3client";

const generateFileName = (bytes = 32) => crypto.randomBytes(bytes).toString("hex");

// public object url (a signed url without its query string), matches the format stored in Photo.fileURL
const getObjectURL = async (key: string) => {
    const getObjectCommand = new GetObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: key,
    });
    const signedURL = await getSignedUrl(s3, getObjectCommand, { expiresIn: 60 });

    return signedURL.split("?")[0];
}

// fetch uploaded object metadata, returns null if the object was never uploaded
const getUploadedObject = async (key: string) => {
    try {
        return await s3.send(new HeadObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME!,
            Key: key,
        }));
    } catch (e) {
        return null;
    }
}

const acceptedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
];

// step 1 of avatar upload: returns a signed url to PUT the file to, call confirmAvatarUpload after uploading
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

        // sign put request for s3 bucket
        const filename = generateFileName();
        const putObjectCommand = new PutObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME!,
            Key: filename,
            ContentType: type,
            ContentLength: size,
            ChecksumSHA256: checksum,
            Metadata: {
                userId: session.user.id,
            }
        });
        const signedURL = await getSignedUrl(s3, putObjectCommand, {
            expiresIn: 60,
        });

        return {success: {url: signedURL, key: filename}}
    } catch (e) {
        console.error(e)
        return { failure: "Unknown error, please try again later" }
    }
}

// step 2 of avatar upload: verifies the object exists in s3, then replaces the user's avatar in the database
export async function confirmAvatarUpload(key: string) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return {failure: "User is not authenticated"}
        }

        // s3 lowercases metadata keys
        const object = await getUploadedObject(key);
        if (!object || object.Metadata?.userid !== session.user.id) {
            return {failure: "Upload not found"}
        }

        const userId = Number(session.user.id);
        const photo = await prisma.photo.findUnique({
            where: {
                userId: userId,
            }
        });

        // already confirmed
        if (photo && photo.filename === key) {
            return {success: {}}
        }

        // delete old photo from s3 and database if present
        if (photo) {
            const deleteObjectCommand = new DeleteObjectCommand({
                Bucket: process.env.AWS_BUCKET_NAME!,
                Key: photo.fileURL.split("/").pop()!,
            });
            await s3.send(deleteObjectCommand);

            await prisma.photo.delete({
                where: {
                    userId: userId,
                }
            });
        }

        // create metadata in database
        await prisma.photo.create({
            data: {
                userId: userId,
                filename: key,
                fileURL: await getObjectURL(key),
                mimetype: object.ContentType!,
                size: object.ContentLength!,
            }
        });

        return {success: {}}
    } catch (e) {
        console.error(e)
        return { failure: "Unknown error, please try again later" }
    }
}

// step 1 of build photo upload: returns a signed url to PUT the file to, call confirmBuildPhotoUpload after uploading
export async function getSignedBuildPhotoURL(buildId: string, isThumbnail: boolean, type: string, size: number, checksum: string) {
    const maxFileSize = 1024 * 1024 * 5; // 5MB

    try {
        // check file size and type
        if (!acceptedTypes.includes(type)) {
            return {failure: "Invalid file type"}
        }
        if (size > maxFileSize) {
            return {failure: "Photo must be under 5MB"}
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

        // sign put request for s3 bucket
        const filename = generateFileName();
        const putObjectCommand = new PutObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME!,
            Key: filename,
            ContentType: type,
            ContentLength: size,
            ChecksumSHA256: checksum,
            Metadata: {
                userId: session.user.id,
                buildId: buildId,
                isThumbnail: String(isThumbnail),
            }
        });
        const signedURL = await getSignedUrl(s3, putObjectCommand, {
            expiresIn: 60,
        });

        return {success: {url: signedURL, key: filename}}
    } catch (e) {
        console.error(e)
        return { failure: "Unknown error, please try again later" }
    }
}

// step 2 of build photo upload: verifies the object exists in s3, then creates the photo in the database
export async function confirmBuildPhotoUpload(key: string) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return {failure: "User is not authenticated"}
        }

        // s3 lowercases metadata keys
        const object = await getUploadedObject(key);
        const buildId = object?.Metadata?.buildid;
        if (!object || !buildId || object.Metadata?.userid !== session.user.id) {
            return {failure: "Upload not found"}
        }

        const build = await prisma.build.findUnique({
            where: {
                build_id: buildId
            }
        });
        if (!build || build.userId !== Number(session.user.id)) {
            return {failure: "User does not have the correct permissions"}
        }

        // already confirmed
        const existingPhoto = await prisma.photo.findFirst({
            where: {
                filename: key,
            }
        });
        if (existingPhoto) {
            return {success: {}}
        }

        // create metadata in database
        await prisma.photo.create({
            data: {
                buildId: buildId,
                filename: key,
                fileURL: await getObjectURL(key),
                mimetype: object.ContentType!,
                size: object.ContentLength!,
                isThumbnail: object.Metadata?.isthumbnail === "true",
            }
        });

        return {success: {}}
    } catch (e) {
        console.error(e)
        return { failure: "Unknown error, please try again later" }
    }
}
