import type {Metadata} from "next";
import {Geist, Geist_Mono} from "next/font/google";
import "./globals.css";
import AuthProvider from '@/providers/AuthProvider'
import {ThemeProvider} from "next-themes";
import {Toaster} from "@/components/ui/sonner";
import {LimitProvider} from "@/providers/LimitProvider";
import React from "react";


const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Ticketly",
    description: "Ticketing made easy",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
        <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
        <AuthProvider>
            <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
            >
                <LimitProvider>
                    {children}
                </LimitProvider>
                <Toaster/>
            </ThemeProvider>
        </AuthProvider>
        </body>
        </html>
    );
}
