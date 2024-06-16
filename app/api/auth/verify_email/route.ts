import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import {NextRequest} from "next/server";

const EMAIL_SECRET = process.env.EMAIL_SECRET as string;

// Verify Email Token
export async function POST(req: NextRequest) {
    const { token } = await req.json();

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
