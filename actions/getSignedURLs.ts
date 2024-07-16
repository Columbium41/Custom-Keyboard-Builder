"use server";

import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/_authOptions";
import {S3Client, PutObjectCommand, DeleteObjectCommand} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";
import {prisma} from "@/lib/prisma";

const generateFileName = (bytes = 32) => crypto.randomBytes(bytes).toString("hex");

const s3 = new S3Client({
    region: process.env.AWS_BUCKET_REGION!,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

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
