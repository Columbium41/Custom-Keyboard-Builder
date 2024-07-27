import {NextRequest} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/_authOptions";
import {prisma} from "@/lib/prisma";
import axios from "axios";

const isValidYouTubeVideo = async (url: string) => {
    const apiKey = process.env.YOUTUBE_API_KEY;
    const videoId = extractVideoId(url);
    if (!videoId) {
        return "";
    }

    const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${apiKey}&part=id`;

    try {
        const response = await axios.get(apiUrl);
        if (response.data.items.length > 0) {
            return videoId;
        }
    } catch (error) {
        console.error('Error validating YouTube video:', error);
        return "";
    }
};

const extractVideoId = (url: string) => {
    const match = url.match(
        /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );
    return match ? match[1] : null;
};

export async function PATCH(req: NextRequest) {
    const { title, caseValue, pcb, plate, switches, keycaps, mods, stabs, youtube_link, build_id } = await req.json();

    // ensure user is authenticated
    const session = await getServerSession(authOptions);
    const build = await prisma.build.findUnique({
        where: {
            build_id: build_id
        },
    });

    if (!session || !session.user) {
        return new Response(JSON.stringify({ error: 'Not authenticated' }), { status: 400 });
    } else if (!build) {
        return new Response(JSON.stringify({ error: "Build not found" }), { status: 400 });
    } else if (build.userId !== Number(session.user.id)) {
        return new Response(JSON.stringify({ error: "Incorrect Permissions" }), { status: 400 });
    } else if (!title || !caseValue || !plate || !switches || !keycaps) {
        return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    } else if (title.length > 255 || caseValue.length > 255 || pcb.length > 255 || plate.length > 255 || switches.length > 255 || keycaps.length > 255 || stabs.length > 255) {
        return new Response(JSON.stringify({ error: 'Fields are too long' }), { status: 400 });
    } else if (mods.length > 1000) {
        return new Response(JSON.stringify({ error: 'Mods is too long' }), { status: 400 });
    } else if (mods.split('\n').length > 15) {
        return new Response(JSON.stringify({ error: 'Mods has too many lines' }), { status: 400 });
    } else {
        // check if youtube link is valid
        const validLink = await isValidYouTubeVideo(youtube_link);


        if (youtube_link && !validLink) {
            return new Response(JSON.stringify({ error: 'Invalid YouTube Link' }), { status: 400 });
        } else {
            // update build metadata in database
            const build = await prisma.build.update({
                where: {
                    build_id: build_id,
                },
                data: {
                    title: title,
                    case: caseValue,
                    pcb: pcb,
                    plate: plate,
                    switches: switches,
                    keycaps: keycaps,
                    stabilizers: stabs,
                    mods: mods,
                    youtubeLink: validLink,
                }
            });

            return new Response(JSON.stringify({ message: 'Successfully created build', buildId: build.build_id }), { status: 200 });
        }
    }
}