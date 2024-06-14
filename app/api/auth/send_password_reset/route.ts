import {sendPasswordReset} from "@/mailer/passwordReset";
import {NextRequest} from "next/server";
import {prisma} from "@/lib/prisma";
import jwt from "jsonwebtoken";

const PASSWORD_RESET_SECRET = process.env.PASSWORD_RESET_SECRET as string;

// Send forgot your password email
export async function POST(req: NextRequest) {
    const { email } = await req.json();

    const user = await prisma.user.findUnique({
        where: { email: email },
    });

    if (!user) {
        return new Response(JSON.stringify({ error: 'Invalid email' }), {
            status: 400,
        });
    } else {
        // Generate JWT & Send email verification link
        const token = jwt.sign(
            { userId: user.id },
            PASSWORD_RESET_SECRET,
            { expiresIn: '1h' }
        );

        await sendPasswordReset(email, token);

        return new Response(JSON.stringify({ message: 'Sent password reset email, please check your inbox' }), {
            status: 200,
        });
    }
}
