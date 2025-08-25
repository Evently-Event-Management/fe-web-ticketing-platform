import {Location} from "@/app/(home-app)/_utils/locations"
import {ArrowRight} from "lucide-react";
import Image from "next/image";


/**
 * LocationCard Component
 * Displays a card for a specific location.
 */
export function LocationCard({location}: { location: Location }) {
    return (
        <a href={`/events?location=${location.name}&latitude=${location.latitude}&longitude=${location.longitude}&radiusKm=50`}>
            <div className="relative rounded-lg overflow-hidden h-64 group">
                <Image src={location.imageUrl} alt={location.name} fill
                       className="absolute inset-0 object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"/>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-4">
                    <h3 className="text-xl font-bold text-white">{location.name}</h3>
                    <p className="text-sm text-white/80 flex items-center">
                        Explore Events <ArrowRight
                        className="ml-1 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"/>
                    </p>
                </div>
            </div>
        </a>
    );
}