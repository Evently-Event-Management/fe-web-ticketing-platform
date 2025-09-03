"use client"

import {TrafficSource} from "@/types/eventAnalytics";
import {Card, CardContent, CardHeader, CardTitle, CardDescription} from "@/components/ui/card";

export const TrafficSourcesChart: React.FC<{ data: TrafficSource[] }> = ({data}) => {
    const totalViews = data.reduce((acc, item) => acc + item.views, 0);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Top Traffic Sources</CardTitle>
                <CardDescription>How users are finding your event page.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {data.map((item, index) => (
                        <div key={index} className="space-y-1">
                            <div className="flex justify-between text-sm">
                                <span className="font-medium capitalize">{item.source}</span>
                                <span className="text-muted-foreground">{item.views.toLocaleString()} views</span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-secondary">
                                <div
                                    className="h-2 rounded-full bg-primary"
                                    style={{width: `${totalViews > 0 ? (item.views / totalViews) * 100 : 0}%`}}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};
