'use client';

import {useState, useEffect} from 'react';
import {useParams} from 'next/navigation';
import {toast} from 'sonner';
import {
    getSeatingLayoutTemplateById,
    updateSeatingLayoutTemplate,
} from '@/lib/actions/seatingLayoutTemplateActions';
import {LayoutData} from '@/types/seatingLayout';
import {LayoutEditor} from '../_components/LayoutEditor';
import {Skeleton} from '@/components/ui/skeleton';

export default function EditSeatingLayoutPage() {
    const params = useParams();
    const organizationId = params.organization_id as string;
    const layoutId = params.layoutId as string;

    const [initialData, setInitialData] = useState<LayoutData | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const template = await getSeatingLayoutTemplateById(layoutId);
                setInitialData(template.layoutData);
            } catch (error) {
                console.error('Failed to load seating layout:', error);
                toast.error('Failed to load seating layout.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [layoutId]);

    const handleSave = async (layoutData: LayoutData) => {
        const request = {
            name: layoutData.name,
            organizationId,
            layoutData,
        };

        toast.promise(updateSeatingLayoutTemplate(layoutId, request), {
            loading: 'Saving changes...',
            success: (data) => `Layout "${data.name}" updated successfully!`,
            error: (err) => err.message || 'Failed to update layout.',
        });
    };

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Skeleton className="h-[80vh] w-[80vw]"/>
            </div>
        );
    }

    return <LayoutEditor initialData={initialData} onSave={handleSave}/>;
}
