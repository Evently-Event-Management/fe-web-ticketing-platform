import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TicketInfo() {
    return (
        <Card className="w-full max-w-xs bg-primary text-primary-foreground">
            <CardHeader>
                <CardTitle>General Admission</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm mb-4">Sales end on Nov 27, 2019</p>
                <p className="text-3xl font-bold mb-4">$100 - $7.5 Free</p>
                <Button variant="secondary" className="w-full bg-white text-primary hover:bg-white/90">Checkout Now</Button>
            </CardContent>
        </Card>
    )
}