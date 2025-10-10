'use client'

import {EventCard} from "@/app/(home-app)/_components/EventCard";
import CategorySection from "@/app/(home-app)/_components/CategorySection";
import {EventThumbnailDTO} from "@/types/event";
import {sriLankaLocations} from "@/app/(home-app)/_utils/locations";
import {LocationCard} from "@/app/(home-app)/_components/LocationCard";
import {ArrowRight, Calendar, MapPin, Ticket} from "lucide-react";
import Link from 'next/link';
import {useAuth} from '@/providers/AuthProvider';
import { useEffect, useState } from 'react';
import {getTrendingEvents, getTotalSessionsCount, getTotalTicketsSold} from '@/lib/actions/public/eventActions';
import { Skeleton } from '@/components/ui/skeleton';
import CounterAnimation from "@/components/ui/counter-animation";

export default function HomePage() {
    const {isAuthenticated, keycloak} = useAuth();
    const [trendingEvents, setTrendingEvents] = useState<EventThumbnailDTO[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [totalSessionsCount, setTotalSessionsCount] = useState<number>(0);
    const [totalTicketsSold, setTotalTicketsSold] = useState<number>(0);
    const [loadingSessionsCount, setLoadingSessionsCount] = useState<boolean>(true);
    const [loadingTicketsCount, setLoadingTicketsCount] = useState<boolean>(true);

    useEffect(() => {
        const fetchTrendingEvents = async () => {
            try {
                setLoading(true);
                const events = await getTrendingEvents(3);
                setTrendingEvents(events);
                setError(null);
            } catch (err) {
                console.error("Failed to fetch trending events:", err);
                setError("Failed to load trending events. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        const fetchTotalSessionsCount = async () => {
            try {
                setLoadingSessionsCount(true);
                const count = await getTotalSessionsCount();
                setTotalSessionsCount(count);
            } catch (err) {
                console.error("Failed to fetch total sessions count:", err);
                setTotalSessionsCount(0);
            } finally {
                setLoadingSessionsCount(false);
            }
        };

        const fetchTotalTicketsSold = async () => {
            try {
                setLoadingTicketsCount(true);
                const count = await getTotalTicketsSold();
                setTotalTicketsSold(count);
            } catch (err) {
                console.error("Failed to fetch total tickets sold:", err);
                setTotalTicketsSold(0);
            } finally {
                setLoadingTicketsCount(false);
            }
        };

        fetchTrendingEvents();
        fetchTotalSessionsCount();
        fetchTotalTicketsSold();
    }, []);

    return (
        <main className="min-h-screen bg-background">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-primary/10 via-background to-primary/5 py-24 md:py-32">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-5xl md:text-7xl font-light tracking-tight text-foreground mb-6">
                            <span className="text-primary">Discover</span>
                            <span className="blSecureHandlerock font-semibold text-foreground/80">Amazing Events</span>
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
                                <div className="text-2xl font-semibold text-foreground">
                                    {loadingSessionsCount ? (
                                        <Skeleton className="h-8 w-16 mx-auto"/>
                                    ) : (
                                        <>
                                            <CounterAnimation
                                                value={totalSessionsCount || 0}
                                                duration={2000}
                                                suffix="+"
                                                startOnView={false}
                                            />
                                        </>
                                    )}
                                </div>
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
                                    <Ticket className="w-6 h-6 text-chart-3"/>
                                </div>
                                <div className="text-2xl font-semibold text-foreground">
                                    {loadingTicketsCount ? (
                                        <Skeleton className="h-8 w-16 mx-auto"/>
                                    ) : (
                                        <>
                                            <CounterAnimation
                                                value={totalTicketsSold || 0}
                                                duration={2000}
                                                suffix="+"
                                                startOnView={false}
                                            />
                                        </>
                                    )}
                                </div>
                                <div className="text-sm text-muted-foreground">Tickets Sold</div>
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
                    
                    {error && (
                        <div className="text-center p-6 bg-destructive/10 rounded-lg max-w-3xl mx-auto mb-8">
                            <p className="text-destructive">{error}</p>
                            <button 
                                onClick={() => {
                                    setLoading(true);
                                    setError(null);
                                    getTrendingEvents()
                                        .then(events => {
                                            setTrendingEvents(events);
                                            setLoading(false);
                                        })
                                        .catch(err => {
                                            console.error(err);
                                            setError("Failed to load trending events. Please try again later.");
                                            setLoading(false);
                                        });
                                }}
                                className="mt-4 px-4 py-2 bg-muted text-foreground rounded-md hover:bg-muted/80"
                            >
                                Try Again
                            </button>
                        </div>
                    )}
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                        {loading ? (
                            // Skeleton loading UI
                            Array(3).fill(0).map((_, index) => (
                                <div key={`skeleton-${index}`} className="flex flex-col space-y-3">
                                    <Skeleton className="h-48 w-full rounded-lg" />
                                    <Skeleton className="h-6 w-3/4" />
                                    <Skeleton className="h-4 w-1/2" />
                                    <Skeleton className="h-4 w-2/3" />
                                    <Skeleton className="h-4 w-1/4" />
                                </div>
                            ))
                        ) : trendingEvents.length > 0 ? (
                            // Display actual events
                            trendingEvents.map((event: EventThumbnailDTO) => (
                                <EventCard key={event.id} event={event} />
                            ))
                        ) : (
                            // No events found
                            <div className="col-span-4 text-center p-12">
                                <p className="text-muted-foreground text-lg">No trending events found at the moment.</p>
                            </div>
                        )}
                    </div>

                    {/* View All Link */}
                    <div className="text-center mt-12">
                        <Link href="/events">
                            <button className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors duration-200 text-lg">
                                View All Events
                                <ArrowRight className="ml-2 w-5 h-5"/>
                            </button>
                        </Link>
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
                            onClick={() => keycloak?.register()}
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
