import {SessionDetailDTO, TierDTO} from "@/lib/validators/event";
import * as React from "react";
import {useState} from "react";
import {useEventContext} from "@/providers/EventProvider";
import {toast} from "sonner";
import {format, parseISO} from "date-fns";
import {SessionType} from "@/types/enums/sessionType";
import {Card, CardContent, CardHeader} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {SessionStatus} from "@/types/enums/sessionStatus";
import {useRouter} from "next/navigation";
import {Button} from "@/components/ui/button";
import {Calendar, Clock, Edit, LinkIcon, MapPin, MoreHorizontal, RefreshCcw, Share2, Trash2} from "lucide-react";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import {
    SessionShareDialog
} from "@/app/manage/organization/[organization_id]/event/_components/sessions/session-share-dialog";

interface SessionCardProps {
    session: SessionDetailDTO;
}

export const SessionCard: React.FC<SessionCardProps> = ({session}) => {
    const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
    const {refetchSession, loadingSessionId, event} = useEventContext();
    const router = useRouter();

    const isRefreshing = loadingSessionId === session.id;
    const organizationId = event?.organizationId;
    const eventId = event?.id;

    const handleEdit = () => {
        // Navigate to the session detail page using Next.js router
        router.push(`/manage/organization/${organizationId}/event/${eventId}/sessions/${session.id}`);
    };

    const handleDelete = () => {
        // Placeholder for delete functionality
        toast.info(`Delete session ${session.id} (Dummy function)`);
    };

    const handleRefreshSession = () => {
        refetchSession(session.id);
    };

    const startDate = parseISO(session.startTime);
    const endDate = parseISO(session.endTime);
    const isOnline = session.sessionType === SessionType.ONLINE;

    // Calculate event duration
    const getDuration = (): string => {
        try {
            const durationMs = endDate.getTime() - startDate.getTime();
            const hours = Math.floor(durationMs / (1000 * 60 * 60));
            const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

            return hours > 0
                ? `${hours}h${minutes > 0 ? ` ${minutes}m` : ''}`
                : `${minutes}m`;
        } catch (e) {
            console.error("Error calculating duration:", e);
            return "N/A";
        }
    };

    // Get seating summary by tier
    const getSeatingDetails = () => {
        if (!session.layoutData?.layout?.blocks?.length) return {
            byType: [],
            byTier: [],
            totalSeats: 0
        };

        // Create a record of tier counts
        const tierCountsRecord: Record<string, number> = {};

        // Process blocks to count seats by tier
        session.layoutData.layout.blocks.forEach((block) => {
            if (block.rows && block.rows.length > 0) {
                // Count seats in rows for seated_grid blocks
                block.rows.forEach((row) => {
                    row.seats.forEach((seat) => {
                        if (seat.status !== "RESERVED") {
                            const tierId = seat.tierId || "unassigned";
                            tierCountsRecord[tierId] = (tierCountsRecord[tierId] || 0) + 1;
                        }
                    });
                });
            } else if (block.seats && block.seats.length > 0) {
                // Count direct seats array (for seated blocks without rows)
                block.seats.forEach((seat) => {
                    if (seat.status !== "RESERVED") {
                        const tierId = seat.tierId || "unassigned";
                        tierCountsRecord[tierId] = (tierCountsRecord[tierId] || 0) + 1;
                    }
                });
            } else if (block.type === "standing_capacity" && block.capacity) {
                // Get tier for standing capacity blocks
                let tierId = "unassigned";

                // Check if block has seats array with tier information
                if (block.seats && block.seats.length > 0 && block.seats[0].tierId) {
                    tierId = block.seats[0].tierId;
                }

                // Add the capacity to the tier count
                tierCountsRecord[tierId] = (tierCountsRecord[tierId] || 0) + (block.capacity || 0);
            }
        });

        // Calculate total seats
        const totalSeats = Object.values(tierCountsRecord).reduce(
            (sum, count) => sum + count,
            0
        );

        // Convert tier counts record to byTier array with tier names and colors
        const byTier: { tier: string; count: number; color?: string }[] = [];

        if (event?.tiers) {
            Object.entries(tierCountsRecord).forEach(([tierId, count]) => {
                if (tierId === "unassigned") {
                    byTier.push({
                        tier: 'Unassigned',
                        count
                    });
                } else {
                    const tier = event.tiers.find((t: TierDTO) => t.id === tierId);
                    if (tier) {
                        byTier.push({
                            tier: tier.name,
                            count,
                            color: tier.color
                        });
                    } else {
                        byTier.push({
                            tier: 'Unknown Tier',
                            count
                        });
                    }
                }
            });
        }

        return {
            byTier,
            totalSeats
        };
    };

    const seatingDetails = getSeatingDetails();

    const navigateToSessionDetails = () => {
        router.push(`/manage/organization/${organizationId}/event/${eventId}/sessions/${session.id}`);
    };

    return (
        <>
            <Card 
                key={session.id} 
                className="hover:shadow-md transition-shadow cursor-pointer" 
                onClick={navigateToSessionDetails}
            >
                <CardHeader className="flex flex-col sm:flex-row items-center justify-between">
                    <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-semibold">
                                {format(startDate, "MMM d, yyyy")}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                {format(startDate, "h:mm a")} - {format(endDate, "h:mm a")}
                            </p>
                            <Badge variant={isOnline ? "secondary" : "default"} className="ml-1">
                                {isOnline ? 'Online' : 'Physical'}
                            </Badge>
                            <Badge
                                variant={
                                    session.status === SessionStatus.SCHEDULED ? "outline" :
                                        session.status === SessionStatus.ON_SALE ? "success" :
                                            session.status === SessionStatus.CLOSED ? "destructive" :
                                                "secondary"
                                }
                            >
                                {session.status}
                            </Badge>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 mt-2 sm:mt-0">
                        <Button
                            type={'button'}
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleRefreshSession();
                            }}
                            disabled={isRefreshing}
                        >
                            <RefreshCcw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}/>
                        </Button>
                        <Button
                            type={'button'}
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsShareDialogOpen(true);
                            }}
                        >
                            <Share2 className="h-4 w-4"/>
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <MoreHorizontal className="h-4 w-4"/>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                                <DropdownMenuItem onSelect={(e) => {
                                    e.stopPropagation();
                                    handleEdit();
                                }}>
                                    <Edit className="h-4 w-4 mr-2"/>
                                    Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="text-destructive"
                                    onSelect={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                    }}
                                >
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <div className="flex items-center w-full cursor-pointer">
                                                <Trash2 className="h-4 w-4 mr-2"/>
                                                Delete
                                            </div>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This action cannot be undone. This will permanently delete the
                                                    session
                                                    on {format(startDate, "MMMM d, yyyy")} and all associated data.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-3">
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground"/>
                                <span className="text-sm">{getDuration()}</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground"/>
                                <span
                                    className="text-sm">Sales start on: {format(parseISO(session.salesStartTime), 'MMM d, h:mm a')}</span>
                            </div>
                        </div>

                        {/* Detailed venue information */}
                        <div className="mt-1 text-sm">
                            {isOnline && session.venueDetails?.onlineLink ? (
                                <div className="flex items-start gap-2">
                                    <LinkIcon className="h-4 w-4 text-muted-foreground mt-0.5"/>
                                    <a href={session.venueDetails.onlineLink} target="_blank" rel="noopener noreferrer"
                                       className="text-primary hover:underline break-all">
                                        {session.venueDetails.onlineLink}
                                    </a>
                                </div>
                            ) : (!isOnline && session.venueDetails?.address) ? (
                                <div className="flex items-start gap-2">
                                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5"/>
                                    <span className="text-muted-foreground">
                    {session.venueDetails?.name || 'No venue'} | {session.venueDetails?.address}
                  </span>
                                </div>
                            ) : null}
                        </div>

                        {/* Seating tier summary */}
                        {seatingDetails.byTier.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {seatingDetails.byTier.map((tier, index) => (
                                    <Badge
                                        key={`tier-${index}`}
                                        variant="outline"
                                        className="bg-muted/30"
                                        style={tier.color ? {
                                            borderColor: tier.color,
                                            backgroundColor: `${tier.color}20` // 20 = 12.5% opacity
                                        } : {}}
                                    >
                                        {tier.tier}: {tier.count}
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <SessionShareDialog
                open={isShareDialogOpen}
                onOpenChange={setIsShareDialogOpen}
                session={session}
            />
        </>
    );
};