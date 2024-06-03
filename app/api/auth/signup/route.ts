import {hash} from "bcrypt";
import {prisma} from "@/lib/prisma";
import {NextRequest} from "next/server";

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
    if (username.length < 6) {
        errors += "Username must be at least 6 characters long\n";
    }

    if (password.length < 8) {
        errors += "Password must be at least 8 characters long\n";
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
    const hashedPassword = await hash(password, 15);

    // Create the new user
    try {
        const user = await prisma.user.create({
            data: {
                email: email,
                password: hashedPassword,
                username: username,
            },
        });

        return new Response(JSON.stringify(user), {
            status: 200,
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: "Failed to create new user" }), {
            status: 500,
        });
    }
}
