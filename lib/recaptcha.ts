import axios from "axios";

// verify a recaptcha token with google, tokens are single use
export async function verifyCaptcha(token: unknown) {
    if (typeof token !== "string" || !token) {
        return false;
    }

    try {
        const res = await axios.post(
            "https://www.google.com/recaptcha/api/siteverify",
            new URLSearchParams({ secret: process.env.RECAPTCHA_SECRET_KEY as string, response: token })
        );

        return res.data?.success === true;
    } catch (error) {
        return false;
    }
}

export const captchaFailedResponse = () =>
    new Response(JSON.stringify({ error: "Please verify the captcha" }), {
        status: 400,
    });
