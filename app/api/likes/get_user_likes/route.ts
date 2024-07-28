import {NextRequest} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/_authOptions";
import {prisma} from "@/lib/prisma";

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return new Response(JSON.stringify({ error: "Not authenticated" }), { status: 400 });
    } else {
        const likes = await prisma.like.findMany({
            where: {
                userId: Number(session.user.id),
            },
        });

        return new Response(JSON.stringify({ likes: likes }), { status: 200 });
    }
}
