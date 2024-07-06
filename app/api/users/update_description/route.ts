import {NextRequest} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/_authOptions";
import {prisma} from "@/lib/prisma";

export async function PATCH(req: NextRequest) {
    const { username, description } = await req.json();
    const session = await getServerSession(authOptions);

    if (!username || !description) {
        return new Response(JSON.stringify({ error: 'Username or description not given' }), { status: 400 });
    }
    else if (!session || !session.user || session.user.name != username) {
        return new Response(JSON.stringify({ error: 'Not authenticated' }), { status: 400 });
    }
    else if (description.length > 1000) {
        return new Response(JSON.stringify({ error: 'Description is too long' }), { status: 400 });
    }
    else {
        await prisma.user.update({
            where: {
                username: username,
            },
            data: {
                description: description,
            },
        });

        return new Response(JSON.stringify({ message: 'Successfully updated description' }), {
            status: 200,
        })
    }
}
