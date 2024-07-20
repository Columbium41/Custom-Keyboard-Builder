import {NextRequest} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/_authOptions";
import {prisma} from "@/lib/prisma";

export async function POST(req: NextRequest) {
    const { title, caseValue, pcb, plate, switches, keycaps, mods } = await req.json();

    // ensure user is authenticated
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return new Response(JSON.stringify({ error: 'Not authenticated' }), { status: 400 });
    } else if (!title || !caseValue || !pcb || !plate || !switches || !keycaps) {
        return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    } else if (title.length > 255 || caseValue.length > 255 || pcb.length > 255 || plate.length > 255 || switches.length > 255 || keycaps.length > 255) {
        return new Response(JSON.stringify({ error: 'Fields are too long' }), { status: 400 });
    } else if (mods.length > 1000) {
        return new Response(JSON.stringify({ error: 'Mods is too long' }), { status: 400 });
    } else if (mods.split('\n').length > 15) {
        return new Response(JSON.stringify({ error: 'Mods has too many lines' }), { status: 400 });
    } else {
        // create build metadata in database
        const build = await prisma.build.create({
            data: {
                title: title,
                case: caseValue,
                pcb: pcb,
                plate: plate,
                switches: switches,
                keycaps: keycaps,
                mods: mods,
                userId: Number(session.user.id),
            }
        });

        return new Response(JSON.stringify({ message: 'Successfully created build', buildId: build.build_id }), { status: 200 });
    }
}