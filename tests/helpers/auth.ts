import type {Account, Profile, User} from "next-auth";
import type {JWT} from "next-auth/jwt";
import {authOptions} from "@/app/api/auth/[...nextauth]/_authOptions";

// helpers for calling next-auth callbacks the way next-auth does

export async function authorizeCredentials(usernameOrEmail: string, password: string) {
    const provider = authOptions.providers.find((p) => p.id === "credentials") as any;
    return provider.options.authorize({ usernameOrEmail, password }, {});
}

export function googleAccount(providerAccountId: string): Account {
    return {
        provider: "google",
        type: "oauth",
        providerAccountId: providerAccountId,
    };
}

export function googleProfile(overrides: Record<string, unknown> = {}): Profile {
    return {
        sub: "google-sub-1",
        email: "person@gmail.com",
        email_verified: true,
        name: "Google Display Name",
        picture: "https://lh3.googleusercontent.com/photo.jpg",
        ...overrides,
    } as Profile;
}

// the user next-auth builds from the google profile, before our callbacks run
export function googleProfileUser(profile: Profile): User {
    const p = profile as any;
    return { id: p.sub, name: p.name, email: p.email, image: p.picture };
}

export async function signInWithGoogle(profileOverrides: Record<string, unknown> = {}) {
    const profile = googleProfile(profileOverrides);
    const account = googleAccount((profile as any).sub);
    const user = googleProfileUser(profile);

    const result = await authOptions.callbacks!.signIn!({ user, account, profile });
    return { result, profile, account, user };
}

// run the jwt callback for a google sign in, starting from next-auth's default token
export async function googleJwt(profileOverrides: Record<string, unknown> = {}) {
    const { profile, account, user } = await signInWithGoogle(profileOverrides);
    const defaultToken: JWT = { name: user.name, email: user.email, picture: user.image, sub: user.id };

    return authOptions.callbacks!.jwt!({ token: defaultToken, user, account, profile, trigger: "signIn" });
}
