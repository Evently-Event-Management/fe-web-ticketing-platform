import {EventCard} from "@/app/(home-app)/_components/EventCard";
import CategorySection from "@/app/(home-app)/_components/CategorySection";
import {Search} from "lucide-react";
import {EventThumbnailDTO} from "@/types/event";
import {sriLankaLocations} from "@/app/(home-app)/_utils/locations";
import Image from "next/image";
import {LocationCard} from "@/app/(home-app)/_components/LocationCard";

const trendingEvents: EventThumbnailDTO[] = [
    {
        id: '1',
        title: 'Colombo Music Fest 2025',
        coverPhotoUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=2070&auto=format=fit=crop',
        organizationName: 'Vibe Events',
        categoryName: 'Music',
        earliestSession: {
            startTime: '2025-09-15T18:00:00Z',
            venueName: 'Galle Face Green',
            city: 'Colombo'
        },
        startingPrice: 25.00
    },
    {
        id: '2',
        title: 'Kandy Esala Perahera Viewing',
        coverPhotoUrl: 'https://images.unsplash.com/photo-1566766188646-5d0310191714?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        organizationName: 'Cultural SL',
        categoryName: 'Culture',
        earliestSession: {
            startTime: '2025-08-28T19:00:00Z',
            venueName: 'Temple of the Tooth',
            city: 'Kandy'
        },
        startingPrice: 15.00
    },
    {
        id: '3',
        title: 'Galle Literary Festival',
        coverPhotoUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=1973&auto=format=fit=crop',
        organizationName: 'Sri Lanka Arts',
        categoryName: 'Arts & Literature',
        earliestSession: {
            startTime: '2025-10-10T10:00:00Z',
            venueName: 'Galle Fort',
            city: 'Galle'
        },
        startingPrice: null
    },
    {
        id: '4',
        title: 'Startup Summit Sri Lanka',
        coverPhotoUrl: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=2070&auto=format=fit=crop',
        organizationName: 'TechHub LK',
        categoryName: 'Tech',
        earliestSession: {
            startTime: '2025-11-05T09:00:00Z',
            venueName: 'BMICH',
            city: 'Colombo'
        },
        startingPrice: 50.00
    },
];

export default function HomePage() {
    return (
        <main className="container mx-auto px-4 py-8">
            {/* Hero Section */}
            <section className="relative mb-12 h-[500px] rounded-lg overflow-hidden">
                <Image
                    src="https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?q=80&w=2070&auto=format&fit=crop"
                    alt="Concert"
                    className="w-full h-full object-cover"
                    width={2070}
                    height={1380}
                    priority
                />
                <div
                    className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-center text-white p-4">
                    <h1 className="text-4xl md:text-6xl font-bold">Events Made Easy</h1>
                    <p className="mt-2">Discover and book your next event effortlessly</p>
                </div>
            </section>

            {/* Category Section */}
            <CategorySection/>

            {/* Trending Events Section */}
            <section className="py-12">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold tracking-tight">Trending Events</h2>
                    <p className="text-muted-foreground mt-2">See what&#39;s popular right now.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 justify-items-center">
                    {trendingEvents.map((event) => (
                        <EventCard key={event.id} event={event}/>
                    ))}
                </div>
            </section>

            {/* Browse by Location Section */}
            <section className="py-12">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold tracking-tight">Explore by Location</h2>
                    <p className="text-muted-foreground mt-2">Find events happening near you or in your favorite
                        city.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {sriLankaLocations
                        .filter(location => !!location.imageUrl)
                        .map((location) => (
                            <LocationCard key={location.name} location={location}/>
                        ))}
                </div>
            </section>
        </main>
    );
}