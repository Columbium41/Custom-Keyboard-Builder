import {NextRequest} from "next/server";
import {prisma} from "@/lib/prisma";

export async function GET(req: NextRequest) {
    const { searchParams } = req.nextUrl;
    const { page = "1", limit = "10", sort = "newest", timeframe = "all_time" } = Object.fromEntries(searchParams.entries());
    const pageNumber = parseInt(page);
    const itemsPerPage = parseInt(limit);
    let date = new Date();
    let orderByObj = {};

    switch (timeframe) {
        case "past_year":
            date.setFullYear(date.getFullYear() - 1);
            break;
        case "past_month":
            date.setDate(date.getDate() - 30);
            break;
        case "past_week":
            date.setDate(date.getDate() - 7);
            break;
        default:
            date = new Date(2023, 1, 1);
            break;
    }

    switch (sort) {
        case "oldest":
            orderByObj = { createdAt: 'asc' }
            break;
        case "most_likes":
            orderByObj = { likes: { _count: 'desc' } }
            break;
        default:
            orderByObj = { createdAt: 'desc' }
            break;
    }

    try {
        // Fetch total count of items
        const totalItems = await prisma.build.count({
            where: {
                createdAt: {
                    gte: date,
                },
            },
        });

        // Fetch paginated items
        const items = await prisma.build.findMany({
            where: {
                createdAt: {
                    gte: date,
                },
            },
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
                _count: {
                    select: { likes: true },
                },
            },
            orderBy: orderByObj
        });

        return new Response(JSON.stringify({ total: totalItems, items }), { status: 200 });
    } catch (error) {
        console.error('Error fetching data:', error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }
}