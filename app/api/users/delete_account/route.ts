import {NextRequest} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/_authOptions";
import {prisma} from "@/lib/prisma";
import {deleteS3Objects} from "@/lib/s3client";
import {invalidBodyResponse, readJSON} from "@/lib/request";

// permanently delete the signed in user's account, the client signs out afterwards
export async function DELETE(req: NextRequest) {
    const body = await readJSON(req);
    if (!body) {
        return invalidBodyResponse();
    }
    const { username } = body;
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return new Response(JSON.stringify({ error: "Not authenticated" }), { status: 400 });
    }
    // the user types their username to confirm
    else if (!username || username !== session.user.name) {
        return new Response(JSON.stringify({ error: "Username does not match" }), { status: 400 });
    }

    const userId = Number(session.user.id);

    // collect the avatar and every build photo before the rows are gone
    const photos = await prisma.photo.findMany({
        where: {
            OR: [
                { userId: userId },
                { build: { userId: userId } },
            ],
        },
        select: { fileURL: true },
    });

    // builds, photos, likes, comments and linked google accounts cascade
    try {
        await prisma.user.delete({
            where: { id: userId },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: "Failed to delete account" }), { status: 500 });
    }

    await deleteS3Objects(photos.map((photo) => photo.fileURL));

    return new Response(JSON.stringify({ message: "Account deleted" }), { status: 200 });
}
