import * as React from 'react';
import {Skeleton} from "@/components/ui/skeleton";
import ReactMarkdown from 'react-markdown';

interface ReviewEventDetailsProps {
    overview?: string;
}

export const EventOverview: React.FC<ReviewEventDetailsProps> = ({
                                                                          overview
                                                                      }) => {
    if (!overview) return null;

    return (
        <>
            {overview && (
                <div className="prose prose-stone max-w-none dark:prose-invert">
                    <ReactMarkdown>
                        {overview}
                    </ReactMarkdown>
                </div>
            )}
        </>
    );
};

export const ReviewEventDetailsSkeleton: React.FC = () => {
    return (
        <div className="space-y-6">
            {/* Description Skeleton */}
            <div className="space-y-2">
                <Skeleton className="h-4 w-3/4"/>
                <Skeleton className="h-4 w-full"/>
                <Skeleton className="h-4 w-5/6"/>
            </div>

            {/* Overview Skeleton */}
            <div className="space-y-4">
                <Skeleton className="h-6 w-1/3"/> {/* Heading */}
                <div className="space-y-2">
                    <Skeleton className="h-4 w-full"/>
                    <Skeleton className="h-4 w-11/12"/>
                    <Skeleton className="h-4 w-10/12"/>
                </div>
            </div>
        </div>
    );
};
