import {NextRequest} from "next/server";
import {prisma} from "@/lib/prisma";

export async function GET(req: NextRequest) {
    const { searchParams } = req.nextUrl;
    const { page = "1", limit = "10" } = Object.fromEntries(searchParams.entries());
    const pageNumber = parseInt(page);
    const itemsPerPage = parseInt(limit);

    try {
        // Fetch total count of items
        const totalItems = await prisma.build.count();

        // Fetch paginated items
        const items = await prisma.build.findMany({
            skip: (pageNumber - 1) * itemsPerPage,
            take: itemsPerPage,
            select: {
                build_id: true,
                title: true,
                case: true,
                pcb: true,
                plate: true,
                switches: true,
                keycaps: true,
                stabilizers: true,
                youtubeLink: true,
                mods: true,
                createdAt: true,
                updatedAt: true,
                photos: true,
                user: {
                    select: {
                        username: true,
                        avatar: true,
                    },
                },
                likes: true,
            },
        });

        return new Response(JSON.stringify({ total: totalItems, items }), { status: 200 });
    } catch (error) {
        console.error('Error fetching data:', error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }
}