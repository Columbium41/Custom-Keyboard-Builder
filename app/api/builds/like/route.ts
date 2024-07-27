import {NextRequest} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/_authOptions";
import {prisma} from "@/lib/prisma";

export async function POST(req: NextRequest) {
    const { buildId } = await req.json();

    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return new Response(JSON.stringify({ error: 'Not authenticated' }), { status: 400 });
    } else if (!buildId) {
        return new Response(JSON.stringify({ error: 'Build Id not present' }), { status: 400 });
    }

    const build = await prisma.build.findUnique({
        where: {
            build_id: buildId
        },
    });

    if (!build) {
        return new Response(JSON.stringify({ error: "Build not found" }), { status: 400 });
    }

    const like = await prisma.like.findUnique({
        where: {
            userId_buildId: {
                userId: Number(session.user.id),
                buildId: buildId,
            },
        },
    });

    if (like) {
        await prisma.like.delete({
            where: {
                userId_buildId: {
                    userId: Number(session.user.id),
                    buildId: buildId,
                },
            },
        });

        return new Response(JSON.stringify({ message: 'Unliked build' }), { status: 200 });
    } else {
        await prisma.like.create({
            data: {
                userId: Number(session.user.id),
                buildId: buildId,
            },
        });

        return new Response(JSON.stringify({ message: 'Successfully liked build' }), { status: 200 });
    }
}
