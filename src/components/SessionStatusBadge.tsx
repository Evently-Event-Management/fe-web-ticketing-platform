import {Badge} from "@/components/ui/badge";
import React from "react";
import {SessionStatus} from "@/types/enums/sessionStatus";

export const SessionStatusBadge: React.FC<{ status: SessionStatus }> = ({ status }) => {
    const statusBadge: { [key in SessionStatus]: string } = {
        [SessionStatus.ON_SALE]: 'success',
        [SessionStatus.SOLD_OUT]: 'destructive',
        [SessionStatus.CANCELED]: 'secondary',
        [SessionStatus.SCHEDULED]: 'default',
        [SessionStatus.CLOSED]: 'outline',
        [SessionStatus.PENDING]: 'warning',
    };

    return (
        <Badge variant={statusBadge[status] as "success" | "destructive" | "secondary" | "default" | "outline" | "warning"}>
            {status.replace('_', ' ')}
        </Badge>
    );
};
