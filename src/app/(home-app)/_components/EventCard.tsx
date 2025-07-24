import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Heart, Share2 } from "lucide-react";
import type { Event} from "@/app/(home-app)/_utils/types"
import Image from "next/image";

export default function EventCard({ event }: { event: Event }) {
    return (
        <Card className="w-full max-w-sm overflow-hidden group pt-0">
            <div className="relative w-full h-60 overflow-hidden">
                <Image
                    src={event.image}
                    alt={event.title}
                    width={500}
                    height={300}
                    className="w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute top-2 left-2">
                    {event.price ? (
                        <span className="rounded-sm bg-white px-3 py-1 text-xs font-bold text-black">${event.price}</span>
                    ) : (
                        <span className="rounded-sm bg-white px-3 py-1 text-xs font-bold text-black">FREE</span>
                    )}
                </div>
                <div className="absolute top-3 right-3 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="icon" variant="secondary" className="rounded-full h-8 w-8 bg-white/20 backdrop-blur-sm hover:bg-white/30">
                        <Share2 className="h-4 w-4 text-white" />
                    </Button>
                    <Button size="icon" variant="secondary" className="rounded-full h-8 w-8 bg-white/20 backdrop-blur-sm hover:bg-white/30">
                        <Heart className="h-4 w-4 text-white" />
                    </Button>
                </div>
            </div>
            <CardContent className="p-4">
                <div className="flex items-start space-x-4">
                    <div className="text-center">
                        <p className="text-sm font-bold text-primary">{event.date.month}</p>
                        <p className="text-xl font-bold">{event.date.day}</p>
                    </div>
                    <div>
                        <CardTitle className="text-base font-bold leading-tight">{event.title}</CardTitle>
                        <CardDescription className="text-xs mt-1">{event.location}</CardDescription>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}