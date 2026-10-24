import {NextRequest} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/_authOptions";
import {prisma} from "@/lib/prisma";
import {Prisma} from "@prisma/client";
import {getUsernameErrors} from "@/lib/user";

// set the username for an oauth account that hasn't completed onboarding
export async function POST(req: NextRequest) {
    const { username } = await req.json();
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return new Response(JSON.stringify({ error: 'Not authenticated' }), { status: 400 });
    } else if (!username || typeof username !== 'string') {
        return new Response(JSON.stringify({ error: 'Username not given' }), { status: 400 });
    }

    const errors = getUsernameErrors(username);
    if (errors) {
        return new Response(JSON.stringify({ error: errors }), { status: 400 });
    }

    const user = await prisma.user.findUnique({
        where: { id: Number(session.user.id) },
    });

    // only allowed once, this is not a rename endpoint
    if (!user) {
        return new Response(JSON.stringify({ error: 'User not found' }), { status: 400 });
    } else if (user.username !== null) {
        return new Response(JSON.stringify({ error: 'Username has already been set' }), { status: 400 });
    }

    try {
        await prisma.user.update({
            where: { id: user.id },
            data: { username: username },
        });
    } catch (err) {
        // unique constraint, username was taken
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
            return new Response(JSON.stringify({ error: 'Username already in use' }), { status: 400 });
        }

        console.error(err);
        return new Response(JSON.stringify({ error: 'Unknown error, please try again later' }), { status: 500 });
    }

    return new Response(JSON.stringify({ message: 'Successfully set username' }), { status: 200 });
}
