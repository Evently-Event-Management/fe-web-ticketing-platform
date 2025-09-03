"use client"

import {ColumnDef} from "@tanstack/react-table";
import {SessionSummary} from "@/types/eventAnalytics";
import {format, parseISO} from "date-fns";
import {formatCurrency} from "@/lib/utils";
import {ArrowUpDown} from "lucide-react";
import {Button} from "@/components/ui/button";
import Link from "next/link";
import {SessionStatusBadge} from "@/components/SessionStatusBadge";

export const columns: ColumnDef<SessionSummary>[] = [
    {
        accessorKey: "startTime",
        header: "Session Date",
        cell: ({row}) => {
            const session = row.original;
            return (
                <Link href={`analytics/${session.sessionId}`}
                      className="font-medium text-primary hover:underline">
                    {format(parseISO(session.startTime), "PPp")}
                </Link>
            );
        },
    },
    {
        accessorKey: "sessionStatus",
        header: "Status",
        cell: ({row}) => <SessionStatusBadge status={row.original.sessionStatus}/>,
    },
    {
        accessorKey: "ticketsSold",
        header: ({column}) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Tickets Sold
                <ArrowUpDown className="ml-2 h-4 w-4"/>
            </Button>
        ),
        cell: ({row}) => {
            const {ticketsSold, sessionCapacity} = row.original;
            return <div className="text-center">{`${ticketsSold} / ${sessionCapacity}`}</div>;
        }
    },
    {
        accessorKey: "sessionRevenue",
        header: ({column}) => (
            <div className="text-right">
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Revenue
                    <ArrowUpDown className="ml-2 h-4 w-4"/>
                </Button>
            </div>
        ),
        cell: ({row}) => <div className="text-right font-medium">{formatCurrency(row.original.sessionRevenue, 'LKR', 'en-LK')}</div>,
    },
    {
        accessorKey: "sellOutPercentage",
        header: "Sell-Out Progress",
        cell: ({row}) => {
            const percentage = row.original.sellOutPercentage;
            return (
                <div className="flex items-center gap-2">
                    <div className="w-full bg-secondary rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full" style={{width: `${percentage}%`}}></div>
                    </div>
                    <span className="text-sm text-muted-foreground w-12 text-right">{percentage.toFixed(0)}%</span>
                </div>
            );
        }
    },
];