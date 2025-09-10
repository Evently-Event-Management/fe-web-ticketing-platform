'use client';

import React from "react";
import {Lock, Home} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardFooter, CardHeader} from "@/components/ui/card";
import {useAuth} from "@/providers/AuthProvider";
import Link from "next/link";

interface NoticeProps {
    title?: string;
    message?: string;
    submessage?: string;
}

const Notice: React.FC<NoticeProps> = ({
                                           title = "Authentication Required",
                                           message = "You need to be logged in to access this page.",
                                           submessage = "Please sign in to continue."
                                       }) => {
    const {keycloak} = useAuth();

    const handleLogin = () => {
        keycloak?.login({
            redirectUri: window.location.href
        }).then(r => console.log(r)).catch(e => console.error(e));
    };

    return (
        <Card className="w-full shadow-md border-muted">
            <CardHeader className="flex items-center justify-center pb-2">
                <div className="rounded-full bg-primary/10 p-3 mb-2">
                    <Lock className="h-8 w-8 text-primary"/>
                </div>
                <h3 className="text-xl font-semibold text-center">
                    {title}
                </h3>
            </CardHeader>
            <CardContent className="text-center text-muted-foreground">
                <p className="mb-2">
                    {message}
                </p>
                <p>
                    {submessage}
                </p>
            </CardContent>
            <CardFooter className="flex justify-center gap-4 pt-2">
                <Button
                    onClick={handleLogin}
                    className="px-8"
                >
                    Sign In
                </Button>
                <Link href="/">
                    <Button
                        variant="outline"
                        className="px-8"
                    >
                        <Home className="mr-2 h-4 w-4"/>
                        Home
                    </Button>
                </Link>
            </CardFooter>
        </Card>
    );
};

export default Notice;
