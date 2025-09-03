"use client"

import {AudienceGeo} from "@/types/eventAnalytics";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export const AudienceGeographyTable: React.FC<{ data: AudienceGeo[] }> = ({data}) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Top Locations</CardTitle>
                <CardDescription>
                    Top countries where your event page is being viewed.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Country</TableHead>
                            <TableHead className="text-right">Page Views</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((item) => (
                            <TableRow key={item.location}>
                                <TableCell className="font-medium">{item.location}</TableCell>
                                <TableCell className="text-right">
                                    {item.views.toLocaleString()}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};
