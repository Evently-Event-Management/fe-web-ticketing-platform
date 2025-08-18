import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import EventCard from "@/app/(home-app)/_components/EventCard";
import CategorySection from "@/app/(home-app)/_components/CategorySection";
import type { Event } from "@/app/(home-app)/_utils/types";
import Image from "next/image";

export default function page() {
    const events: Event[] = [
        {
            image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=2070&auto=format&fit=crop",
            price: "10.00",
            date: { month: "SEP", day: "18" },
            title: "Indonesia - Korea Conference",
            location: "Soehanna, Daerah Khusus Ibukota Yogyakarta, Indonesia",
        },
        {
            image: "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?q=80&w=2070&auto=format&fit=crop",
            price: null,
            date: { month: "SEP", day: "17" },
            title: "Dream World Wide in Jakarta",
            location: "Soehanna, Daerah Khusus Ibukota Yogyakarta, Indonesia",
        },
        {
            image: "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?q=80&w=2070&auto=format&fit=crop",
            price: "12.00",
            date: { month: "SEP", day: "16" },
            title: "Pesta Kembang Api Terbesar",
            location: "Soehanna, Daerah Khusus Ibukota Yogyakarta, Indonesia",
        },
        {
            image: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=2070&auto=format&fit=crop",
            price: "10.00",
            date: { month: "SEP", day: "15" },
            title: "Event Untuk Para Jomblo",
            location: "Soehanna, Daerah Khusus Ibukota Yogyakarta, Indonesia",
        },
        {
            image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=2070&auto=format&fit=crop",
            price: null,
            date: { month: "SEP", day: "14" },
            title: "Makan Bersama Di Malam Hari",
            location: "Soehanna, Daerah Khusus Ibukota Yogyakarta, Indonesia",
        },
        {
            image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070&auto=format&fit=crop",
            price: "12.00",
            date: { month: "SEP", day: "13" },
            title: "Konser Musik Terbesar",
            location: "Soehanna, Daerah Khusus Ibukota Yogyakarta, Indonesia",
        },
        {
            image: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=2012&auto=format&fit=crop",
            price: "10.00",
            date: { month: "SEP", day: "12" },
            title: "UI UX Design & Prototyping",
            location: "Soehanna, Daerah Khusus Ibukota Yogyakarta, Indonesia",
        },
        {
            image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop",
            price: null,
            date: { month: "SEP", day: "11" },
            title: "Presiden Amerika Ke Indonesia",
            location: "Soehanna, Daerah Khusus Ibukota Yogyakarta, Indonesia",
        },
        {
            image: "https://images.unsplash.com/photo-1561489396-888724a1543d?q=80&w=2070&auto=format&fit=crop",
            price: "12.00",
            date: { month: "SEP", day: "10" },
            title: "Tahap Awal Belajar UI UX",
            location: "Soehanna, Daerah Khusus Ibukota Yogyakarta, Indonesia",
        },
    ];

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
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-center text-white p-4">
                    <h1 className="text-4xl md:text-6xl font-bold">Events Made Easy</h1>
                    <p className="mt-2">Discover and book your next event effortlessly</p>
                </div>
            </section>

            {/* Category Section */}
            <CategorySection />

            <div className="h-16"></div>

            {/* Upcoming Events Section */}
            <section className={'max-w-7xl mx-auto px-4'}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold">Upcoming Events</h2>
                    <div className="flex items-center space-x-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline">Weekdays</Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem>Today</DropdownMenuItem>
                                <DropdownMenuItem>Tomorrow</DropdownMenuItem>
                                <DropdownMenuItem>This Weekend</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline">Event Type</Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem>Conference</DropdownMenuItem>
                                <DropdownMenuItem>Concert</DropdownMenuItem>
                                <DropdownMenuItem>Workshop</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline">Any Category</Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem>Music</DropdownMenuItem>
                                <DropdownMenuItem>Tech</DropdownMenuItem>
                                <DropdownMenuItem>Business</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
                    {events.map((event, index) => (
                        <EventCard key={index} event={event} />
                    ))}
                </div>
            </section>
        </main>
    );
};