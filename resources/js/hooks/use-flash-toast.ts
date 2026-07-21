import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

interface FlashProps {
    success?: string;
    error?: string;
}

export function useFlashToast(flash?: FlashProps): void {
    const prevSuccess = useRef<string | undefined>(undefined);
    const prevError = useRef<string | undefined>(undefined);

    useEffect(() => {
        if (flash?.success && flash.success !== prevSuccess.current) {
            prevSuccess.current = flash.success;
            toast.success(flash.success);
        }

        if (flash?.error && flash.error !== prevError.current) {
            prevError.current = flash.error;
            toast.error(flash.error);
        }
    }, [flash]);
}
