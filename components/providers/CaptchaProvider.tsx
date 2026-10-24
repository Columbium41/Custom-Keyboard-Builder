'use client';

import React, {createContext, RefObject, useCallback, useContext, useRef, useState} from 'react';
import ReCAPTCHA from "react-google-recaptcha";

interface CaptchaContextType {
    captchaToken: string | null,
    setCaptchaToken: (captchaToken: string | null) => void,
    recaptchaRef: RefObject<ReCAPTCHA>,
    resetCaptcha: () => void,
}

type Props = {
    children?: React.ReactNode
}

const CaptchaContext = createContext<CaptchaContextType | undefined>(undefined);

export function CaptchaProvider({ children }: Props) {
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);
    const recaptchaRef = useRef<ReCAPTCHA>(null);

    // tokens are single use, so clear the widget after every submit
    const resetCaptcha = useCallback(() => {
        recaptchaRef.current?.reset();
        setCaptchaToken(null);
    }, []);

    return (
        <CaptchaContext.Provider value={{ captchaToken, setCaptchaToken, recaptchaRef, resetCaptcha }}>
            {children}
        </CaptchaContext.Provider>
    );
}

export function useCaptcha() {
    const context = useContext(CaptchaContext);
    if (context === undefined) {
        throw new Error('useCaptcha must be used within a CaptchaProvider');
    }
    return context;
}
