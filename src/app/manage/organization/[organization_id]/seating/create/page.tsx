'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { createSeatingLayoutTemplate } from '@/lib/actions/seatingLayoutTemplateActions';
import { LayoutData } from '@/types/seatingLayout';
import { LayoutEditor } from '../_components/LayoutEditor';

export default function CreateSeatingLayoutPage() {
    const params = useParams();
    const router = useRouter();
    const organizationId = params.organization_id as string;
    const [isLoading, setIsLoading] = useState(false);

    const handleSave = async (layoutData: LayoutData) => {
        setIsLoading(true);
        const request = {
            name: layoutData.name,
            organizationId,
            layoutData,
        };

        toast.promise(createSeatingLayoutTemplate(request), {
            loading: 'Saving new layout...',
            success: (data) => {
                // Redirect to the new edit page on success
                router.push(`/manage/organization/${organizationId}/seating/${data.id}`);
                return `Layout "${data.name}" created successfully!`;
            },
            error: (err) => err.message || 'Failed to create layout.',
            finally: () => setIsLoading(false),
        });
    };

    return <LayoutEditor onSave={handleSave} isLoading={isLoading} />;
}
