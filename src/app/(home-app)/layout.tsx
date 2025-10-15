import Topbar from "@/app/(home-app)/_components/Topbar";
import {Footer} from "@/app/(home-app)/_components/Footer";
import { GoogleAnalytics } from '@next/third-parties/google';
import React from "react";


export default function Layout({
                                   children,
                               }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="relative flex min-h-screen flex-col">
            <Topbar/>
            <div className="flex-1">
                {children}
                <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID || ''} />
            </div>
            <Footer/>
        </div>
    );
}
