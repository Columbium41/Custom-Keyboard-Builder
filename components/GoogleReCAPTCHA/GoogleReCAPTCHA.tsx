'use client';

import ReCAPTCHA from "react-google-recaptcha";
import {useCaptcha} from "@/components/providers/CaptchaProvider";

export default function GoogleReCAPTCHA({ className }: { className?: string }) {
    const { recaptchaRef, setCaptchaToken } = useCaptcha();

    // keep the token for the form to send, the server verifies it
    // onChange gets null when the token expires
    return (
        <ReCAPTCHA
            sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITEKEY || ''}
            ref={recaptchaRef}
            onChange={setCaptchaToken}
            className={className}
        />
    )
}
