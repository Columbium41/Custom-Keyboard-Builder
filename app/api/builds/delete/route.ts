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
        const photos = await prisma.photo.findMany({
            where: {
                buildId: buildId,
            },
        });

        // delete build first, photos, likes and comments cascade
        try {
            await prisma.build.delete({
                where: {
                    build_id: buildId,
                },
            });
        } catch (error) {
            return new Response(JSON.stringify({ error: "Failed to delete build" }), { status: 500 });
        }

        // then delete s3 photos, a failure only leaves an orphaned file so don't fail the request
        const results = await Promise.allSettled(photos.map((photo) => s3.send(new DeleteObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME!,
            Key: photo.fileURL.split("/").pop()!,
        }))));

        results.forEach((result, i) => {
            if (result.status === "rejected") {
                console.error(`Failed to delete s3 object for photo ${photos[i].photo_id}`, result.reason);
            }
        });

        return new Response(JSON.stringify({ message: "OK" }), { status: 200 });
    }
}