import {NextRequest} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/_authOptions";
import {prisma} from "@/lib/prisma";
import {DeleteObjectCommand} from "@aws-sdk/client-s3";
import s3 from "@/lib/s3client";

export async function DELETE(req: NextRequest) {
    const { buildId } = await req.json();
    const session = await getServerSession(authOptions);

    if (!buildId) {
        return new Response(JSON.stringify({ error: "build id not found" }), { status: 400 });
    }

    const build = await prisma.build.findUnique({
        where: {
            build_id: buildId,
        },
    });

    if (!session || !session.user) {
        return new Response(JSON.stringify({ error: "Not authenticated" }), { status: 400 })
    } else if (!build) {
        return new Response(JSON.stringify({ error: "Build not found" }), { status: 400 });
    } else if (Number(session.user.id) !== build.userId) {
        return new Response(JSON.stringify({ error: "Incorrect Permissions" }), { status: 400 });
    } else {
        // delete s3 photos
        const photos = await prisma.photo.findMany({
            where: {
                buildId: buildId,
            },
        });

        for (let i = 0; i < photos.length; i++) {
            const photo = photos[i];
            const deleteObjectCommand = new DeleteObjectCommand({
                Bucket: process.env.AWS_BUCKET_NAME!,
                Key: photo.fileURL.split("/").pop()!,
            });

            await s3.send(deleteObjectCommand)
        }

        // delete build
        await prisma.build.delete({
            where: {
                build_id: buildId,
            },
        });

        return new Response(JSON.stringify({ message: "OK" }), { status: 200 });
    }
}