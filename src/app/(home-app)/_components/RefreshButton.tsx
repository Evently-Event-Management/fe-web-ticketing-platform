'use client';

import {useRouter} from 'next/navigation';
import {useTransition, type ReactNode} from 'react';
import {cn} from '@/lib/utils';

interface RefreshButtonProps {
    children: ReactNode;
    className?: string;
    pendingText?: string;
}

export function RefreshButton({children, className, pendingText = 'Refreshing...'}: RefreshButtonProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    return (
        <button
            onClick={() => startTransition(() => router.refresh())}
            disabled={isPending}
            className={cn(
                'px-6 py-3 bg-muted text-foreground rounded-full hover:bg-muted/80 transition-all shadow-sm hover:shadow disabled:opacity-70 disabled:cursor-not-allowed',
                className
            )}
        >
            {isPending ? pendingText : children}
        </button>
    );
}
