import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Under Maintenance | Ticketly",
  description: "Our system is currently undergoing maintenance. We'll be back soon!",
};

export default function MaintenancePage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="space-y-1 flex flex-col items-center text-center pb-2">
          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-4">
            <AlertTriangle className="h-6 w-6 text-amber-600" />
          </div>
          <CardTitle className="text-2xl">System Maintenance</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            We're currently performing scheduled maintenance on our system to improve your experience.
          </p>
          <p className="text-muted-foreground">
            We apologize for any inconvenience this may cause and appreciate your patience.
            Our team is working diligently to complete the maintenance as quickly as possible.
          </p>
          <div className="py-4">
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div className="bg-primary h-full animate-pulse"></div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center pb-6 pt-2">
          <Button asChild variant="outline">
            <Link href="/">Try Again</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}