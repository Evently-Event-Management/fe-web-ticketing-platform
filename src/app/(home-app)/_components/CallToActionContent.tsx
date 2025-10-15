'use client';

import Image from 'next/image';
import Link from 'next/link';
import {ArrowRight} from 'lucide-react';
import {useAuth} from '@/providers/AuthProvider';

export function CallToActionContent() {
    const {isAuthenticated, keycloak} = useAuth();

    return (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-12 border border-white/20 shadow-2xl">
            <div className="flex flex-col md:flex-row items-center text-center md:text-left gap-8">
                <div className="md:flex-1">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                        Ready to discover your next adventure?
                    </h2>
                    <p className="text-xl text-white/80 mb-8">
                        {isAuthenticated
                            ? 'Create amazing events and reach thousands of attendees with our powerful platform.'
                            : 'Join thousands of people who trust us to find their perfect events and experiences.'
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
                    <div className="absolute inset-0 bg-white/5 backdrop-blur-sm rounded-full"/>
                    <div className="relative h-48 w-48 flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full border-2 border-white/30 animate-pulse"/>
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
    );
}
