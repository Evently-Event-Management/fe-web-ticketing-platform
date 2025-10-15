'use client';

import Image from 'next/image';
import Link from 'next/link';
import {ArrowRight} from 'lucide-react';
import {useAuth} from '@/providers/AuthProvider';

export function CallToActionContent() {
    const {isAuthenticated, keycloak} = useAuth();

    return (
        <div className="bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-12 border border-white/20 shadow-2xl">
            <div className="flex flex-col md:flex-row items-center text-center md:text-left gap-6 sm:gap-8">
                <div className="md:flex-1">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-6 leading-tight">
                        Ready to discover your next adventure?
                    </h2>
                    <p className="text-base sm:text-lg md:text-xl text-white/80 mb-5 sm:mb-8">
                        {isAuthenticated
                            ? 'Create amazing events and reach thousands of attendees with our powerful platform.'
                            : 'Join thousands of people who trust us to find their perfect events and experiences.'
                        }
                    </p>

                    {isAuthenticated ? (
                        <Link href="/manage/organization" className="w-full md:w-auto inline-block">
                            <button className="w-full md:w-auto group relative inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-white text-primary rounded-full hover:bg-white/90 transition-all duration-300 shadow-lg shadow-black/10 text-base sm:text-lg font-medium">
                                Create Events
                                <ArrowRight className="ml-2 w-4 sm:w-5 h-4 sm:h-5 transform group-hover:translate-x-1 transition-transform" />
                            </button>
                        </Link>
                    ) : (
                        <button
                            onClick={() => keycloak?.register()}
                            className="w-full md:w-auto group relative inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-white text-primary rounded-full hover:bg-white/90 transition-all duration-300 shadow-lg shadow-black/10 text-base sm:text-lg font-medium">
                            Get Started
                            <ArrowRight className="ml-2 w-4 sm:w-5 h-4 sm:h-5 transform group-hover:translate-x-1 transition-transform" />
                        </button>
                    )}
                </div>

                <div className="hidden md:block relative">
                    <div className="absolute inset-0 bg-white/5 backdrop-blur-sm rounded-full"/>
                    <div className="relative h-40 lg:h-48 w-40 lg:w-48 flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full border-2 border-white/30 animate-pulse"/>
                        <div className="h-28 lg:h-32 w-28 lg:w-32 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
                            <div className="relative h-36 lg:h-40 w-36 lg:w-40">
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
                
                {/* Small logo for mobile only */}
                <div className="block md:hidden relative my-4">
                    <div className="relative h-20 w-20 mx-auto">
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
    );
}
