import NextAuth from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            name: string | null, // username, null until onboarding is completed
            email: string,
            image: any,
            id: string,
            createdAt: Date,
            updatedAt: Date,
        }
    }
}
