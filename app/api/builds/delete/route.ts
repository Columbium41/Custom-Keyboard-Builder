import {NextRequest} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/_authOptions";
import {prisma} from "@/lib/prisma";
import {deleteS3Objects} from "@/lib/s3client";
import {invalidBodyResponse, readJSON} from "@/lib/request";

export async function DELETE(req: NextRequest) {
    const body = await readJSON(req);
    if (!body) {
        return invalidBodyResponse();
    }
    const { buildId } = body;
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
        await deleteS3Objects(photos.map((photo) => photo.fileURL));

        return new Response(JSON.stringify({ message: "OK" }), { status: 200 });
    }
}