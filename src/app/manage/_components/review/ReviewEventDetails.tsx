import * as React from 'react';
import {Skeleton} from "@/components/ui/skeleton";

interface ReviewEventDetailsProps {
    description?: string;
    overview?: string;
}

export const ReviewEventDetails: React.FC<ReviewEventDetailsProps> = ({
                                                                          description,
                                                                          overview
                                                                      }) => {
    if (!description && !overview) return null;

    return (
        <div className="space-y-6">
            {description && (
                <div className="text-lg leading-relaxed">
                    {description}
                </div>
            )}

            {overview && (
                <div className="prose prose-stone max-w-none dark:prose-invert">
                    <h2 className="text-2xl font-semibold mb-4">About This Event</h2>
                    <div className="whitespace-pre-wrap">{overview}</div>
                </div>
            )}
        </div>
    );
};

export const ReviewEventDetailsSkeleton: React.FC = () => {
    return (
        <div className="space-y-6">
            {/* Description Skeleton */}
            <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
            </div>

            {/* Overview Skeleton */}
            <div className="space-y-4">
                <Skeleton className="h-6 w-1/3" /> {/* Heading */}
                <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-11/12" />
                    <Skeleton className="h-4 w-10/12" />
                </div>
            </div>
        </div>
    );
};
