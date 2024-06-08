'use client';

import React, { createContext, useContext } from "react";
import {ToastOptions} from "react-hot-toast";
import useToast from "@/hooks/useToast";

interface ToastContextType {
    showToast: (message: string, options?: ToastOptions, toastType?: 'success' | 'error' | 'loading') => void;
    showToastPromise: (
        promise: Promise<any>,
        messages: { loading: string; success: string; error: string | ((err: any) => string) },
        options?: ToastOptions
    ) => void;
}

type Props = {
    children?: React.ReactNode
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: Props) => {
    const toast = useToast();

    return (
        <ToastContext.Provider value={toast}>
            { children }
        </ToastContext.Provider>
    );
};

export const useToastContext = () => {
    const context = useContext(ToastContext);
    if (context === undefined) {
        throw new Error('useToastContext must be used within a ToastProvider');
    }
    return context;
};
