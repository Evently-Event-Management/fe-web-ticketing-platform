import React from 'react';

const Page =async ({params}: { params: Promise<{ organization: string }> }) => {
        return (
            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                Hello
            </div>
        );
    }
;

export default Page;