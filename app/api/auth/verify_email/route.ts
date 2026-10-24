import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import {NextRequest} from "next/server";
import {invalidBodyResponse, readJSON} from "@/lib/request";

const EMAIL_SECRET = process.env.EMAIL_SECRET as string;

// Verify Email Token
export async function POST(req: NextRequest) {
    const body = await readJSON(req);
    if (!body) {
        return invalidBodyResponse();
    }
    const { token } = body;

    if (!token || Array.isArray(token)) {
        return new Response(JSON.stringify({ error: 'Invalid or expired token' }), {
            status: 400,
        });
    } else {
        try {
            // Verify JWT
            const decoded = jwt.verify(token, EMAIL_SECRET);
            // @ts-ignore
            const userId = decoded.userId;

            const user = await prisma.user.findUnique({
                where: { id: userId },
            });

            if (!user) {
                return new Response(JSON.stringify({ error: 'Invalid or expired token' }), {
                    status: 400,
                });
            } else if (user.verified) {
                return new Response(JSON.stringify({ message: 'User is already verified' }), {
                    status: 200,
                });
            } else {
                await prisma.user.update({
                    where: { id: userId },
                    data: { verified: true },
                });

                return new Response(JSON.stringify({ message: 'Successfully verified account' }), {
                    status: 200,
                });
            }
        } catch (error) {
            return new Response(JSON.stringify({ error: 'Invalid or expired token' }), {
                status: 400,
            })
        }
    }
}
