import React from 'react';

const Page =async ({params}: { params: Promise<{ organization_id: string }> }) => {
        return (
            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                Organization Management Page: {(await params).organization_id}
            </div>
        );
    }
;

export default Page;