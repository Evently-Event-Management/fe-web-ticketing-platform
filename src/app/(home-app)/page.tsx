'use client'

import {EventCard} from "@/app/(home-app)/_components/EventCard";
import CategorySection from "@/app/(home-app)/_components/CategorySection";
import {EventThumbnailDTO} from "@/types/event";
import {sriLankaLocations} from "@/app/(home-app)/_utils/locations";
import {LocationCard} from "@/app/(home-app)/_components/LocationCard";
import {ArrowRight, Calendar, MapPin, Users} from "lucide-react";
import Link from 'next/link';
import {useAuth} from '@/providers/AuthProvider';

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
    const {isAuthenticated, keycloak} = useAuth();

    return (
        <main className="min-h-screen bg-background">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-primary/10 via-background to-primary/5 py-24 md:py-32">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-5xl md:text-7xl font-light tracking-tight text-foreground mb-6">
                            <span className="text-primary">Discover</span>
                            <span className="block font-semibold text-foreground/80">Amazing Events</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-muted-foreground mb-12 font-light max-w-2xl mx-auto">
                            Find and book extraordinary experiences happening around you
                        </p>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto mb-16">
                            <div className="text-center">
                                <div
                                    className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mx-auto mb-3">
                                    <Calendar className="w-6 h-6 text-primary"/>
                                </div>
                                <div className="text-2xl font-semibold text-foreground">1000+</div>
                                <div className="text-sm text-muted-foreground">Events</div>
                            </div>
                            <div className="text-center">
                                <div
                                    className="flex items-center justify-center w-12 h-12 bg-chart-2/10 rounded-full mx-auto mb-3">
                                    <MapPin className="w-6 h-6 text-chart-2"/>
                                </div>
                                <div className="text-2xl font-semibold text-foreground">25+</div>
                                <div className="text-sm text-muted-foreground">Cities</div>
                            </div>
                            <div className="text-center">
                                <div
                                    className="flex items-center justify-center w-12 h-12 bg-chart-3/10 rounded-full mx-auto mb-3">
                                    <Users className="w-6 h-6 text-chart-3"/>
                                </div>
                                <div className="text-2xl font-semibold text-foreground">50K+</div>
                                <div className="text-sm text-muted-foreground">Attendees</div>
                            </div>
                        </div>

                        <Link href="/events">
                            <button
                                className="inline-flex items-center px-8 py-4 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors duration-200 text-lg">
                                Explore Events
                                <ArrowRight className="ml-2 w-5 h-5"/>
                            </button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Categories Section */}
            <section className="py-20 bg-primary/5 border-t border-border">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-light text-foreground mb-4">
                            <span className="text-primary font-medium">Browse</span> by Category
                        </h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Discover events tailored to your interests across various categories
                        </p>
                    </div>
                    <CategorySection/>
                </div>
            </section>

            {/* Trending Events Section */}
            <section className="py-20 bg-primary/10">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-light text-foreground mb-4">
                            <span className="text-primary font-medium">Trending</span> Events
                        </h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Don&#39;t miss out on the most popular events happening right now
                        </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
                        {trendingEvents.map((event) => (
                            <EventCard key={event.id} event={event}/>
                        ))}
                    </div>
                </div>
            </section>

            {/* Locations Section */}
            <section className="py-20 bg-chart-1/10">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-light text-foreground mb-4">
                            <span className="text-chart-1 font-medium">Explore</span> by Location
                        </h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Find exciting events happening in cities across Sri Lanka
                        </p>
                    </div>
                    <div
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
                        {sriLankaLocations
                            .filter(location => !!location.imageUrl)
                            .map((location) => (
                                <LocationCard key={location.name} location={location}/>
                            ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-primary">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl md:text-4xl font-light text-primary-foreground mb-6">
                        Ready to discover your next adventure?
                    </h2>
                    <p className="text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
                        {isAuthenticated
                            ? "Create amazing events and reach thousands of attendees"
                            : "Join thousands of people who trust us to find their perfect events"
                        }
                    </p>

                    {isAuthenticated ? (
                        <Link href="/manage/organization">
                            <button className="inline-flex items-center px-8 py-4 bg-background text-foreground rounded-full hover:bg-muted transition-colors duration-200 text-lg font-medium">
                                Create Events
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </button>
                        </Link>
                    ) : (
                        <button
                            onClick={() => keycloak.register()}
                            className="inline-flex items-center px-8 py-4 bg-background text-foreground rounded-full hover:bg-muted transition-colors duration-200 text-lg font-medium">
                            Get Started
                            <ArrowRight className="ml-2 w-5 h-5" />
                        </button>
                    )}
                </div>
            </section>
        </main>
    );
}