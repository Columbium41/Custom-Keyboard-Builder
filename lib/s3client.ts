import {DeleteObjectCommand, S3Client} from "@aws-sdk/client-s3";

const s3 = new S3Client({
    region: process.env.AWS_BUCKET_REGION!,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

export default s3;

// best effort, a failure only leaves an orphaned file so log it instead of throwing
export async function deleteS3Objects(fileURLs: string[]) {
    const keys = fileURLs.map((fileURL) => fileURL.split("/").pop()!);
    const results = await Promise.allSettled(keys.map((key) => s3.send(new DeleteObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: key,
    }))));

    results.forEach((result, i) => {
        if (result.status === "rejected") {
            console.error(`Failed to delete s3 object ${keys[i]}`, result.reason);
        }
    });
}
