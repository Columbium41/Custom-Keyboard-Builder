import {useState, useEffect} from "react";
import { toast, ToastOptions } from "react-hot-toast";

type ToastType = 'success' | 'error' | 'loading';

const useToast = () => {
    const [toastId, setToastId] = useState<string | null>(null);
    const [toastMessage, setToastMessage] = useState<string>('');
    const [toastOptions, setToastOptions] = useState<ToastOptions>({});
    const [toastType, setToastType] = useState<ToastType>('success');

    useEffect(() => {
        if (toastMessage) {
            let id: string | null = null;

            switch (toastType) {
                case 'success':
                    id = toast.success(toastMessage, toastOptions);
                    break;
                case 'error':
                    id = toast.error(toastMessage, toastOptions);
                    break;
                case 'loading':
                    id = toast.loading(toastMessage, toastOptions);
                    break;
                default:
                    id = toast(toastMessage, toastOptions);
                    break;
            }

            setToastId(id);
        }

        return () => {
            if (toastId) {
                toast.dismiss(toastId);
            }
        };
    }, [toastMessage, toastOptions, toastType]);

    const showToast = (message: string, options: ToastOptions = {}, toastType: ToastType = 'success') => {
        setToastMessage(message);
        setToastOptions(options);
        setToastType(toastType);
    };

    const showToastPromise = async (
        promise: Promise<any>,
        messages: { loading: string; success: string; error: string | ((err: any) => string) },
        options: ToastOptions = {}
    ) => {
         await toast.promise(promise, {
            loading: messages.loading,
            success: messages.success,
            error: messages.error,
        }, options);
    };

    return { showToast, showToastPromise };
};

export default useToast;
