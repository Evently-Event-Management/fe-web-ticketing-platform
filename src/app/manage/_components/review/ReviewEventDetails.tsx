'use client';

import * as React from 'react';

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
