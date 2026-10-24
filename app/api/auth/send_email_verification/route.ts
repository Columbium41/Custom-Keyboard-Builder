import {prisma} from "@/lib/prisma";
import {NextRequest} from "next/server";
import jwt from "jsonwebtoken";
import {captchaFailedResponse, verifyCaptcha} from "@/lib/recaptcha";
import {sendEmailVerification} from "@/mailer/emailVerification";

const EMAIL_SECRET = process.env.EMAIL_SECRET as string;

// Re-send email verification token
export async function POST(req: NextRequest) {
    const { email, captchaToken } = await req.json();

    if (!(await verifyCaptcha(captchaToken))) {
        return captchaFailedResponse();
    }

    const user = await prisma.user.findUnique({
        where: { email: email },
    });

    if (!user) {
        return new Response(JSON.stringify({ error: 'Invalid email' }), {
            status: 400,
        });
    } else if (user.verified) {
        return new Response(JSON.stringify({ message: 'Email already verified' }), {
            status: 200,
        });
    } else {
        // Generate JWT & Send email verification link
        const token = jwt.sign(
            { userId: user.id },
            EMAIL_SECRET,
            { expiresIn: '24h' }
        );

        await sendEmailVerification(email, token);

        return new Response(JSON.stringify({ message: 'Resent Verification Email, please check your inbox' }), {
            status: 200,
        });
    }
}