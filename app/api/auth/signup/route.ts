import {hash} from "bcrypt";
import {prisma} from "@/lib/prisma";
import {NextRequest} from "next/server";
import jwt from "jsonwebtoken";
import {sendEmailVerification} from "@/mailer/emailVerification";

export async function POST(req: NextRequest) {
    const { username, email, password, passwordConfirmation } = await req.json();

    let errors = '';

    // check for missing fields
    if (!username || !email || !password || !passwordConfirmation) {
        return new Response(JSON.stringify({ error: 'Missing fields' }), {
            status: 400,
        });
    }

    // check that username & password are minimum lengths
    if (username.length < 6 || username.length > 30) {
        errors += "Username must be between 6-30 characters\n";
    }
    if (password.length < 8 || password.length > 40) {
        errors += "Password must be between 8-40 characters\n";
    }

    // check that username doesn't contain '@'
    if (username.includes('@')) {
        errors += "Username cannot contain the \'@\' symbol";
    }

    // check that password matches password confirmation
    if (password != passwordConfirmation) {
        errors += "Passwords do not match";
    }

    if (errors) {
        return new Response(JSON.stringify({ error: errors }), {
            status: 400,
        });
    }

    // check if user already exists (email or username)
    const existingUser = await prisma.user.findFirst({
        where: {
            OR: [
                { email: email },
                { username: username }
            ],
        },
    });

    if (existingUser) {
        return new Response(JSON.stringify({ error: 'Username or email already in use' }), {
            status: 400,
        });
    }

    // Hash the password
    const hashedPassword = await hash(password, 14);

    // Create the new user
    try {
        const user = await prisma.user.create({
            data: {
                email: email,
                password: hashedPassword,
                username: username,
            },
        });

        // Generate JWT & Send email verification link
        const token = jwt.sign(
            { userId: user.id },
            process.env.EMAIL_SECRET as string,
            { expiresIn: '24h' }
        );

        await sendEmailVerification(email, token);

        return new Response(JSON.stringify(user), {
            status: 200,
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: "Failed to create new user" }), {
            status: 500,
        });
    }
}
