'use client';

import ReCAPTCHA from "react-google-recaptcha";
import {useRef} from "react";
import {verifyCaptcha} from "@/app/(auth)/_recaptcha";
import {useCaptcha} from "@/components/providers/CaptchaProvider";

export default function GoogleReCAPTCHA({ className }: { className?: string }) {
    const recaptchaRef = useRef<ReCAPTCHA>(null);
    const { setIsCaptchaVerified } = useCaptcha();

    // recaptcha action
    const handleCaptchaSubmission = async (token: string | null) => {
        await verifyCaptcha(token)
            .then(() => setIsCaptchaVerified(true))
            .catch(() => setIsCaptchaVerified(false));
    };

    return (
        <ReCAPTCHA
            sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITEKEY || ''}
            ref={recaptchaRef}
            onChange={handleCaptchaSubmission}
            className={className}
        />
    )
}