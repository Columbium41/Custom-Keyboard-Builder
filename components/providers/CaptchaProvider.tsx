'use client';

import React, {createContext, useContext, useState} from 'react';

interface CaptchaContextType {
    isCaptchaVerified: boolean,
    setIsCaptchaVerified: (isCaptchaVerified: boolean) => void,
}

type Props = {
    children?: React.ReactNode
}

const CaptchaContext = createContext<CaptchaContextType | undefined>(undefined);

export function CaptchaProvider({ children }: Props) {
    const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);

    return (
        <CaptchaContext.Provider value={{ isCaptchaVerified, setIsCaptchaVerified }}>
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
