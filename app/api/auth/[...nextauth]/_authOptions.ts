import type {NextAuthOptions} from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider, {GoogleProfile} from "next-auth/providers/google";
import {prisma} from "@/lib/prisma";
import {compare} from "bcrypt";
import {User} from "@prisma/client";

const GOOGLE_PROVIDER = "google";

// find the user that owns a google identity, linking or creating one if needed
async function getOrCreateGoogleUser(providerAccountId: string, email: string) {
    // google identity already linked
    const account = await prisma.account.findUnique({
        where: {
            provider_providerAccountId: {
                provider: GOOGLE_PROVIDER,
                providerAccountId: providerAccountId,
            }
        },
        include: { user: true },
    });

    if (account) {
        return account.user;
    }

    const existingUser = await prisma.user.findFirst({
        where: {
            email: {
                equals: email,
                mode: 'insensitive',
            }
        }
    });

    // verified password account, link google to it
    if (existingUser && existingUser.verified) {
        await prisma.account.create({
            data: {
                provider: GOOGLE_PROVIDER,
                providerAccountId: providerAccountId,
                userId: existingUser.id,
            }
        });

        return existingUser;
    }

    // unverified password account, google proved email ownership so take it over.
    // clear the password so whoever registered the email can't sign in once it's verified
    if (existingUser) {
        return prisma.user.update({
            where: { id: existingUser.id },
            data: {
                password: null,
                username: null,
                verified: true,
                accounts: {
                    create: {
                        provider: GOOGLE_PROVIDER,
                        providerAccountId: providerAccountId,
                    }
                }
            }
        });
    }

    // new user, username is chosen afterwards in /complete_profile
    return prisma.user.create({
        data: {
            email: email,
            verified: true,
            accounts: {
                create: {
                    provider: GOOGLE_PROVIDER,
                    providerAccountId: providerAccountId,
                }
            }
        }
    });
}

export const authOptions: NextAuthOptions = {
    session: {
        strategy: 'jwt'
    },
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
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

                    // google-only account
                    if (!user.password) {
                        return { error: "This account uses Google sign-in, please continue with Google." }
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
                    name: token.name ?? null,
                    createdAt: token.createdAt,
                    updatedAt: token.updatedAt
                }
            }
        },
        jwt: async ({ token, user, account, trigger }) => {
            // google sign in, user is the google profile so load our user instead
            if (account?.provider === GOOGLE_PROVIDER) {
                const googleAccount = await prisma.account.findUnique({
                    where: {
                        provider_providerAccountId: {
                            provider: GOOGLE_PROVIDER,
                            providerAccountId: account.providerAccountId,
                        }
                    },
                    include: { user: true },
                });

                if (!googleAccount) {
                    return token;
                }

                // drop the google display name and picture from the token
                const { picture, ...rest } = token;

                return {
                    ...rest,
                    id: googleAccount.user.id.toString(),
                    name: googleAccount.user.username,
                    createdAt: googleAccount.user.createdAt,
                    updatedAt: googleAccount.user.updatedAt
                }
            }

            if (user) {
                const u = user as unknown as User

                return {
                    ...token,
                    id: u.id,
                    createdAt: u.createdAt,
                    updatedAt: u.updatedAt
                }
            }

            // session update from the client (e.g. after choosing a username), reload from the database
            if (trigger === "update" && token.id) {
                const dbUser = await prisma.user.findUnique({
                    where: { id: Number(token.id) },
                });

                if (dbUser) {
                    return {
                        ...token,
                        name: dbUser.username,
                        updatedAt: dbUser.updatedAt
                    }
                }
            }

            return token
        },
        async signIn({ user, account, profile }) {
            if (account?.provider === GOOGLE_PROVIDER) {
                const googleProfile = profile as GoogleProfile | undefined;

                if (!googleProfile?.email || !googleProfile.email_verified) {
                    return '/signin?error=GoogleEmailUnverified';
                }

                try {
                    const dbUser = await getOrCreateGoogleUser(account.providerAccountId, googleProfile.email);

                    // update user last login to now
                    await prisma.user.update({
                        where: { id: dbUser.id },
                        data: { lastLogin: new Date() },
                    });
                } catch (err) {
                    console.error(err);
                    return '/signin?error=GoogleSignInFailed';
                }

                return true;
            }

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
