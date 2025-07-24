import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";

export default function DateAndTime() {
    return (
        <Card className="w-full max-w-xs">
            <CardContent className="p-6">
                <div className="mb-4">
                    <h4 className="font-semibold">Date & Time</h4>
                    <p className="text-muted-foreground text-sm">Saturday, Sep 14, 2019 at 20:30 PM</p>
                </div>
                <Button variant="ghost" className="w-full justify-start p-0 h-auto mb-4">
                    <Plus className="mr-2 h-4 w-4"/> Add to Calendar
                </Button>
                <Button className="w-full mb-2">Book Now (Free)</Button>
                <Button variant="secondary" className="w-full mb-2">Promoter Program</Button>
                <p className="text-center text-xs text-muted-foreground">No Refunds</p>
            </CardContent>
        </Card>
    )
}