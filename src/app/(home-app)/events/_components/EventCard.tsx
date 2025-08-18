import Image from 'next/image';
import {EventSearchResult} from "@/lib/actions/public/eventActions"; // Make sure this path is correct
import {Card, CardContent, CardFooter, CardHeader} from '@/components/ui/card';
import {Building, Calendar, MapPin} from 'lucide-react';
import {AspectRatio} from '@radix-ui/react-aspect-ratio';

interface EventCardProps {
    event: EventSearchResult['content'][0];
}

// Helper to format dates
const formatEventDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
};

export function EventCard({event}: EventCardProps) {
    const {
        title,
        coverPhotoUrl,
        organizationName,
        categoryName,
        earliestSession,
        startingPrice
    } = event;

    return (
        <Card className="overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 pt-0">
            <CardHeader className="p-0">
                <AspectRatio ratio={16 / 9}>
                    <Image
                        src={coverPhotoUrl || '/placeholder.png'}
                        alt={title}
                        fill
                        className="object-cover"
                    />
                </AspectRatio>
            </CardHeader>
            <CardContent>
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">{categoryName}</p>
                <h3 className="font-bold text-lg leading-tight truncate">{title}</h3>
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <Building className="w-4 h-4"/>
                    <span>{organizationName}</span>
                </div>
            </CardContent>
            <CardFooter className="p-4 pt-0 flex justify-between items-center bg-muted/50">
                <div className="text-sm text-muted-foreground space-y-1">
                    <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 flex-shrink-0"/>
                        <span className="truncate">{earliestSession.venueName}, {earliestSession.city}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 flex-shrink-0"/>
                        <span>{formatEventDate(earliestSession.startTime)}</span>
                    </div>
                </div>
                {startingPrice !== null && (
                    <div className="text-right">
                        <p className="text-xs text-muted-foreground">From</p>
                        <p className="font-bold text-lg text-primary">LKR {startingPrice.toLocaleString()}</p>
                    </div>
                )}
            </CardFooter>
        </Card>
    );
}