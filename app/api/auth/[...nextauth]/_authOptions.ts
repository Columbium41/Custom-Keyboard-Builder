import type {NextAuthOptions} from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import {prisma} from "@/lib/prisma";
import {compare} from "bcrypt";
import {User} from "@prisma/client";

export const authOptions: NextAuthOptions = {
    session: {
        strategy: 'jwt'
    },
    providers: [
        CredentialsProvider({
            name: 'Password',
            credentials: {
                usernameOrEmail: {
                    label: 'usernameOrEmail',
                    type: 'string',
                    placeholder: 'hello@example.com'
                },
                password: {
                    label: 'Password',
                    type: 'password'
                }
            },
            // @ts-ignore
            async authorize(credentials) {
                if (!credentials?.usernameOrEmail || !credentials.password) {
                    return { error: "Sign In failed, please check your credentials." }
                }

                try {
                    let user = null;

                    // email
                    if (credentials.usernameOrEmail.includes("@")) {
                        user = await prisma.user.findUnique({
                            where: {
                                email: credentials.usernameOrEmail
                            }
                        });
                    }
                    // username
                    else {
                        user = await prisma.user.findUnique({
                            where: {
                                username: credentials.usernameOrEmail
                            }
                        });
                    }

                    // not found in users table
                    if (!user) {
                        return { error: "Sign In failed, please check your credentials." }
                    }

                    const isPasswordValid = await compare(credentials.password, user.password)

                    if (!isPasswordValid) {
                        return { error: "Sign In failed, please check your credentials." }
                    }

                    if (!user.verified) {
                        return { error: "Your account is not verified, please check your email and verify it." }
                    }

                    return {
                        id: user.id.toString(),
                        email: user.email,
                        name: user.username,
                        createdAt: user.createdAt,
                        updatedAt: user.updatedAt
                    }
                } catch (err) {
                    console.log(err);
                    return { error: 'Unknown Server Error, please try again later' }
                }
            }
        })
    ],
    pages: {
        signIn: '/signin'
    },
    callbacks: {
        session: ({ session, token }) => {
            return {
                ...session,
                user: {
                    ...session.user,
                    id: token.id,
                    createdAt: token.createdAt,
                    updatedAt: token.updatedAt
                }
            }
        },
        jwt: ({ token, user }) => {
            if (user) {
                const u = user as unknown as User

                return {
                    ...token,
                    id: u.id,
                    createdAt: u.createdAt,
                    updatedAt: u.updatedAt
                }
            }

            return token
        },
        async signIn({ user, account, profile, email, credentials }) {
            if (!user) {
                throw new Error("Unknown Error");
            }
            // @ts-ignore
            else if (user && user.error !== undefined) {
                // @ts-ignore
                throw new Error(user.error);
            }

            // update user last login to now
            await prisma.user.update({
                where: { id: parseInt(user.id) },
                data: { lastLogin: new Date() },
            })

            return true;
        }
    }
}