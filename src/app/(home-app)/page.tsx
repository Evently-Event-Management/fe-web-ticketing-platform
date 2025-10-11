'use client'

import {EventCard} from "@/app/(home-app)/_components/EventCard";
import CategorySection from "@/app/(home-app)/_components/CategorySection";
import {EventThumbnailDTO} from "@/types/event";
import {sriLankaLocations} from "@/app/(home-app)/_utils/locations";
import {LocationCard} from "@/app/(home-app)/_components/LocationCard";
import {ArrowRight, Calendar, MapPin, Ticket} from "lucide-react";
import Link from 'next/link';
import Image from 'next/image';
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
            <section className="relative overflow-hidden py-24 md:py-36 lg:py-48">
                {/* Abstract background shapes */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-48 -right-48 w-96 h-96 rounded-full bg-primary/20 blur-3xl"></div>
                    <div className="absolute top-1/2 -left-24 w-64 h-64 rounded-full bg-chart-2/20 blur-3xl"></div>
                    <div className="absolute -bottom-24 right-1/3 w-80 h-80 rounded-full bg-chart-3/20 blur-3xl"></div>
                    <div className="hidden md:block absolute top-1/4 left-1/4 w-32 h-32 rounded-full border-4 border-primary/30 opacity-20"></div>
                    <div className="hidden md:block absolute bottom-1/3 right-1/4 w-48 h-48 rounded-full border-4 border-chart-2/30 opacity-20"></div>
                </div>
                
                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="inline-flex items-center px-4 py-2 bg-primary/10 text-primary rounded-full mb-8 backdrop-blur-sm">
                            <span className="text-sm font-medium">The premier ticketing platform</span>
                        </div>
                        
                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-r from-primary via-chart-2 to-chart-3 text-transparent bg-clip-text animate-gradient">
                            Discover <span className="font-extrabold">Amazing</span> Events
                        </h1>
                        
                        <p className="text-xl md:text-2xl text-muted-foreground mb-12 font-light max-w-2xl mx-auto">
                            Find and book extraordinary experiences happening around you
                        </p>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto mb-16">
                            <div className="relative group">
                                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/5 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                                <div className="relative bg-background/80 backdrop-blur-sm rounded-xl p-6 transition-all duration-300 border border-border/50 group-hover:translate-y-[-3px] group-hover:shadow-xl">
                                    <div className="flex items-center justify-center w-14 h-14 bg-primary/10 rounded-full mx-auto mb-4">
                                        <Calendar className="w-7 h-7 text-primary"/>
                                    </div>
                                    <div className="text-3xl font-bold text-foreground">
                                        {loadingSessionsCount ? (
                                            <Skeleton className="h-10 w-20 mx-auto"/>
                                        ) : (
                                            <CounterAnimation
                                                value={totalSessionsCount || 0}
                                                duration={2000}
                                                suffix="+"
                                                startOnView={false}
                                            />
                                        )}
                                    </div>
                                    <div className="text-sm font-medium text-muted-foreground">Events</div>
                                </div>
                            </div>
                            
                            <div className="relative group">
                                <div className="absolute inset-0 bg-gradient-to-r from-chart-2/20 to-chart-2/5 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                                <div className="relative bg-background/80 backdrop-blur-sm rounded-xl p-6 transition-all duration-300 border border-border/50 group-hover:translate-y-[-3px] group-hover:shadow-xl">
                                    <div className="flex items-center justify-center w-14 h-14 bg-chart-2/10 rounded-full mx-auto mb-4">
                                        <MapPin className="w-7 h-7 text-chart-2"/>
                                    </div>
                                    <div className="text-3xl font-bold text-foreground">25+</div>
                                    <div className="text-sm font-medium text-muted-foreground">Cities</div>
                                </div>
                            </div>
                            
                            <div className="relative group">
                                <div className="absolute inset-0 bg-gradient-to-r from-chart-3/20 to-chart-3/5 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                                <div className="relative bg-background/80 backdrop-blur-sm rounded-xl p-6 transition-all duration-300 border border-border/50 group-hover:translate-y-[-3px] group-hover:shadow-xl">
                                    <div className="flex items-center justify-center w-14 h-14 bg-chart-3/10 rounded-full mx-auto mb-4">
                                        <Ticket className="w-7 h-7 text-chart-3"/>
                                    </div>
                                    <div className="text-3xl font-bold text-foreground">
                                        {loadingTicketsCount ? (
                                            <Skeleton className="h-10 w-20 mx-auto"/>
                                        ) : (
                                            <CounterAnimation
                                                value={totalTicketsSold || 0}
                                                duration={2000}
                                                suffix="+"
                                                startOnView={false}
                                            />
                                        )}
                                    </div>
                                    <div className="text-sm font-medium text-muted-foreground">Tickets Sold</div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link href="/events">
                                <button className="inline-flex items-center px-8 py-4 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-all duration-300 text-lg shadow-lg hover:shadow-primary/25 hover:shadow-xl">
                                    Explore Events
                                    <ArrowRight className="ml-2 w-5 h-5"/>
                                </button>
                            </Link>
                            <Link href="/manage/organization">
                                <button className="inline-flex items-center px-8 py-4 bg-background border border-border text-foreground rounded-full hover:bg-muted transition-all duration-300 text-lg">
                                    Create Event
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Categories Section */}
            <section className="py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background"></div>
                <div className="absolute right-0 top-1/4 w-64 h-64 rounded-full bg-primary/10 blur-3xl opacity-70"></div>
                <div className="absolute left-0 bottom-1/4 w-80 h-80 rounded-full bg-chart-1/10 blur-3xl opacity-70"></div>
                
                <div className="container mx-auto px-4 relative z-10">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-16">
                        <div className="text-left md:max-w-lg">
                            <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">
                                CATEGORIES
                            </div>
                            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
                                <span className="text-primary">Browse</span> by Category
                            </h2>
                            <p className="text-lg text-muted-foreground">
                                Discover events tailored to your interests across various categories. From music concerts to workshops, find events that match your passion.
                            </p>
                        </div>
                    </div>
                    
                    <div className="relative">
                        <CategorySection/>
                    </div>
                </div>
            </section>

            {/* Trending Events Section */}
            <section className="py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-chart-2/5 to-chart-3/5"></div>
                
                {/* Decorative elements */}
                <div className="absolute -left-20 top-20 w-40 h-40 border border-primary/20 rounded-full"></div>
                <div className="absolute right-40 bottom-40 w-60 h-60 border-2 border-chart-2/20 rounded-full opacity-60"></div>
                <div className="absolute right-60 top-20 w-20 h-20 bg-chart-3/10 rounded-full blur-xl"></div>
                
                <div className="container mx-auto px-4 relative z-10">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-16">
                        <div className="text-left md:max-w-lg">
                            <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">
                                HOT & HAPPENING
                            </div>
                            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4 flex flex-col md:flex-row md:items-center gap-2">
                                <span className="text-primary">Trending</span> Events
                                <span className="hidden md:inline-block w-3 h-3 rounded-full bg-chart-3 animate-pulse"></span>
                            </h2>
                            <p className="text-lg text-muted-foreground">
                                Don&#39;t miss out on the most popular events happening right now. These are the events everyone is talking about.
                            </p>
                        </div>
                        
                        <Link href="/events" className="hidden md:inline-flex">
                            <button className="group relative inline-flex items-center px-6 py-3 overflow-hidden rounded-full border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300">
                                <span>View All Events</span>
                                <ArrowRight className="ml-2 w-5 h-5 transform group-hover:translate-x-1 transition-transform"/>
                            </button>
                        </Link>
                    </div>
                    
                    {error && (
                        <div className="relative overflow-hidden">
                            <div className="absolute inset-0 bg-destructive/5 backdrop-blur-sm rounded-xl"></div>
                            <div className="text-center p-8 bg-background/70 backdrop-blur-sm rounded-xl border border-destructive/20 max-w-3xl mx-auto mb-8 relative z-10">
                                <p className="text-destructive font-medium mb-2">Oops! Something went wrong</p>
                                <p className="text-muted-foreground mb-6">{error}</p>
                                <button 
                                    onClick={() => {
                                        setLoading(true);
                                        setError(null);
                                        getTrendingEvents(3)
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
                                    className="px-6 py-3 bg-muted text-foreground rounded-full hover:bg-muted/80 transition-all shadow-sm hover:shadow"
                                >
                                    Try Again
                                </button>
                            </div>
                        </div>
                    )}
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                        {loading ? (
                            // Enhanced skeleton loading UI with animation
                            Array(3).fill(0).map((_, index) => (
                                <div key={`skeleton-${index}`} className="bg-background/40 backdrop-blur-sm border border-border/30 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col animate-pulse">
                                    <div className="relative">
                                        <Skeleton className="h-56 w-full" />
                                        <div className="absolute top-4 right-4">
                                            <Skeleton className="h-8 w-16 rounded-full" />
                                        </div>
                                    </div>
                                    <div className="p-6 space-y-4">
                                        <Skeleton className="h-7 w-3/4" />
                                        <div className="flex items-center space-x-2">
                                            <Skeleton className="h-4 w-4 rounded-full" />
                                            <Skeleton className="h-4 w-1/3" />
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Skeleton className="h-4 w-4 rounded-full" />
                                            <Skeleton className="h-4 w-2/5" />
                                        </div>
                                        <div className="flex justify-between items-center pt-4">
                                            <Skeleton className="h-5 w-1/4" />
                                            <Skeleton className="h-10 w-24 rounded-full" />
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : trendingEvents.length > 0 ? (
                            // Display actual events
                            trendingEvents.map((event: EventThumbnailDTO) => (
                                <EventCard key={event.id} event={event} />
                            ))
                        ) : (
                            // No events found
                            <div className="col-span-3 text-center bg-background/60 backdrop-blur-sm rounded-xl border border-border/20 p-12 shadow-sm">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-muted rounded-full mb-4">
                                    <Calendar className="w-8 h-8 text-muted-foreground" />
                                </div>
                                <h3 className="text-xl font-medium mb-2">No Events Found</h3>
                                <p className="text-muted-foreground text-lg">We couldn&#39;t find any trending events at the moment. Check back later!</p>
                            </div>
                        )}
                    </div>

                    {/* Mobile View All Link */}
                    <div className="text-center mt-12 md:hidden">
                        <Link href="/events">
                            <button className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-all duration-300 text-lg shadow-lg">
                                View All Events
                                <ArrowRight className="ml-2 w-5 h-5"/>
                            </button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Locations Section */}
            <section className="py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-background via-chart-1/10 to-background"></div>
                
                {/* Map-like decorative elements */}
                <div className="absolute inset-0 opacity-5">
                    <div className="absolute top-1/4 left-1/4 w-2 h-2 rounded-full bg-chart-1"></div>
                    <div className="absolute top-1/3 left-2/3 w-3 h-3 rounded-full bg-chart-1"></div>
                    <div className="absolute top-2/3 left-1/5 w-2 h-2 rounded-full bg-chart-1"></div>
                    <div className="absolute top-1/2 left-3/4 w-2 h-2 rounded-full bg-chart-1"></div>
                    <div className="absolute top-3/4 left-1/2 w-4 h-4 rounded-full bg-chart-1"></div>
                    <div className="absolute top-1/8 left-1/3 w-2 h-2 rounded-full bg-chart-1"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-3 h-3 rounded-full bg-chart-1"></div>
                </div>
                
                <div className="container mx-auto px-4 relative z-10">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-16">
                        <div className="text-left md:max-w-lg">
                            <div className="inline-flex items-center px-3 py-1 rounded-full bg-chart-1/10 text-chart-1 text-xs font-medium mb-4">
                                DESTINATIONS
                            </div>
                            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
                                <span className="text-chart-1">Explore</span> by Location
                            </h2>
                            <p className="text-lg text-muted-foreground">
                                Find exciting events happening in cities across Sri Lanka. Discover local culture, music, and entertainment wherever you go.
                            </p>
                        </div>
                        
                        <div className="hidden md:block">
                            <div className="relative h-24 w-24 flex items-center justify-center">
                                <div className="absolute inset-0 rounded-full border-4 border-dashed border-chart-1/30 animate-spin-slow"></div>
                                <div className="bg-chart-1/20 backdrop-blur-sm h-16 w-16 rounded-full flex items-center justify-center">
                                    <MapPin className="h-8 w-8 text-chart-1" />
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
                        {sriLankaLocations
                            .filter(location => !!location.imageUrl)
                            .map((location) => (
                                <LocationCard key={location.name} location={location}/>
                            ))}
                    </div>
                    
                    <div className="flex justify-center mt-12">
                        <div className="inline-flex items-center px-4 py-2 rounded-full bg-background/70 backdrop-blur-sm border border-border/50 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4 mr-2 text-chart-1" />
                            <span>More locations coming soon</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative py-32 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/90">
                    {/* Abstract shapes */}
                    <div className="absolute inset-0">
                        <div className="absolute top-0 left-1/4 w-1/2 h-1/2 bg-white/5 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 right-1/4 w-1/2 h-1/2 bg-white/5 rounded-full blur-3xl"></div>
                    </div>
                    
                    {/* Decorative circles */}
                    <div className="hidden md:block absolute -top-20 -right-20 w-40 h-40 border border-white/10 rounded-full"></div>
                    <div className="hidden md:block absolute -bottom-40 -left-20 w-80 h-80 border border-white/10 rounded-full"></div>
                    <div className="hidden md:block absolute top-1/4 right-1/4 w-24 h-24 border border-white/10 rounded-full"></div>
                </div>
                
                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-12 border border-white/20 shadow-2xl">
                            <div className="flex flex-col md:flex-row items-center text-center md:text-left gap-8">
                                <div className="md:flex-1">
                                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                                        Ready to discover your next adventure?
                                    </h2>
                                    <p className="text-xl text-white/80 mb-8">
                                        {isAuthenticated
                                            ? "Create amazing events and reach thousands of attendees with our powerful platform."
                                            : "Join thousands of people who trust us to find their perfect events and experiences."
                                        }
                                    </p>
                                    
                                    {isAuthenticated ? (
                                        <Link href="/manage/organization">
                                            <button className="group relative inline-flex items-center px-8 py-4 bg-white text-primary rounded-full hover:bg-white/90 transition-all duration-300 shadow-lg shadow-black/10 text-lg font-medium">
                                                Create Events
                                                <ArrowRight className="ml-2 w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
                                            </button>
                                        </Link>
                                    ) : (
                                        <button
                                            onClick={() => keycloak?.register()}
                                            className="group relative inline-flex items-center px-8 py-4 bg-white text-primary rounded-full hover:bg-white/90 transition-all duration-300 shadow-lg shadow-black/10 text-lg font-medium">
                                            Get Started
                                            <ArrowRight className="ml-2 w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    )}
                                </div>
                                
                                <div className="hidden md:block relative">
                                    <div className="absolute inset-0 bg-white/5 backdrop-blur-sm rounded-full"></div>
                                    <div className="relative h-48 w-48 flex items-center justify-center">
                                        <div className="absolute inset-0 rounded-full border-2 border-white/30 animate-pulse"></div>
                                        <div className="h-32 w-32 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
                                            <div className="relative h-40 w-40">
                                                <Image 
                                                    src="/images/logo-high.png"
                                                    alt="Ticketly Logo"
                                                    fill
                                                    className="object-contain"
                                                    priority
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
