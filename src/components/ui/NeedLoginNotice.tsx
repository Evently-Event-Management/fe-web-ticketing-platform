'use client';

import React from "react";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import keycloak from "@/lib/keycloak";

const NeedLoginNotice: React.FC = () => {

  const handleLogin = () => {
    // You can customize this to direct to your login page
    keycloak.login({
        redirectUri: window.location.href
    }).then(r  => console.log(r)).catch(e => console.error(e));
  };

  return (
    <Card className="w-full shadow-md border-muted">
      <CardHeader className="flex items-center justify-center pb-2">
        <div className="rounded-full bg-primary/10 p-3 mb-2">
          <Lock className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-xl font-semibold text-center">
          Authentication Required
        </h3>
      </CardHeader>
      <CardContent className="text-center text-muted-foreground">
        <p className="mb-2">
          You need to be logged in to select and book tickets.
        </p>
        <p>
          Please sign in to continue with your booking.
        </p>
      </CardContent>
      <CardFooter className="flex justify-center pt-2">
        <Button
          onClick={handleLogin}
          className="px-8"
        >
          Sign In
        </Button>
      </CardFooter>
    </Card>
  );
};

export default NeedLoginNotice;
