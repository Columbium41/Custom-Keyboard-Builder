import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import {NextRequest} from "next/server";
import {hash} from "bcrypt";
import {sendPasswordResetConfirmation} from "@/mailer/passwordReset";
import {invalidBodyResponse, readJSON} from "@/lib/request";

const PASSWORD_RESET_SECRET = process.env.PASSWORD_RESET_SECRET as string;

// Verify Token
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
            const decoded = jwt.verify(token, PASSWORD_RESET_SECRET);
            // @ts-ignore
            const userId = decoded.userId;

            const user = await prisma.user.findUnique({
                where: { id: userId },
            });

            if (!user) {
                return new Response(JSON.stringify({ error: 'Invalid or expired token' }), {
                    status: 400,
                });
            }
            // google-only account
            else if (!user.password) {
                return new Response(JSON.stringify({ error: 'This account uses Google sign-in and does not have a password' }), {
                    status: 400,
                });
            } else {
                return new Response(JSON.stringify({ message: 'Token is valid' }), {
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

// change password
export async function PATCH(req: NextRequest) {
    const body = await readJSON(req);
    if (!body) {
        return invalidBodyResponse();
    }
    const { token, newPassword, passwordConfirmation } = body;

    if (newPassword.length < 8 || newPassword.length > 40) {
        return new Response(JSON.stringify({ error: 'Passwords must be between 8 and 40 characters' }), {
            status: 400,
        });
    }
    else if (newPassword != passwordConfirmation) {
        return new Response(JSON.stringify({ error: 'Passwords do not match' }), {
            status: 400,
        });
    }
    else if (!token || Array.isArray(token)) {
        return new Response(JSON.stringify({ error: 'Invalid or expired token' }), {
            status: 400,
        });
    }
    else {
        try {
            // Verify JWT
            const decoded = jwt.verify(token, PASSWORD_RESET_SECRET);
            // @ts-ignore
            const userId = decoded.userId;

            const user = await prisma.user.findUnique({
                where: { id: userId },
            });

            if (!user) {
                return new Response(JSON.stringify({ error: 'Invalid or expired token' }), {
                    status: 400,
                });
            }
            // google-only account
            else if (!user.password) {
                return new Response(JSON.stringify({ error: 'This account uses Google sign-in and does not have a password' }), {
                    status: 400,
                });
            } else {
                const hashedPassword = await hash(newPassword, 14);

                await prisma.user.update({
                    where: { id: userId },
                    data: { password: hashedPassword }
                });

                await sendPasswordResetConfirmation(user.email);

                return new Response(JSON.stringify({ message: 'Password successfully changed' }), {
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
