'use client';

// src/App.js (or your analytics page component)
import React, { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from '@/components/ui/card';
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

// Recharts components
import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    BarChart,
    XAxis,
    YAxis,
    Bar,
    CartesianGrid,
} from 'recharts';

// Lucide React Icons (ensure you have lucide-react installed: npm install lucide-react)
import {
    DollarSign,
    Ticket,
    Percent,
    CalendarDays,
    ArrowLeft,
    BarChart3,
    PieChart as PieChartIcon,
} from 'lucide-react';

// --- Mock Data (Based on your EventDocument structure) ---
const mockEventData = {
    id: 'evt_c7a7e7a0-9a2c-4b5d-85f8-1c4c1e1f1e1e',
    title: 'Interstellar Live: A Cinematic Journey',
    status: 'APPROVED',
    organization: { id: 'org_1', name: 'Cosmic Concerts', logoUrl: 'logo.png' },
    category: { id: 'cat_2', name: 'Film & Music', parentName: 'Entertainment' },
    tiers: [
        { id: 'tier_1', name: 'Starlight VIP', price: 150.00, color: '#FFD700' }, // Gold
        { id: 'tier_2', name: 'Galaxy General', price: 75.00, color: '#8A2BE2' }, // Purple
        { id: 'tier_3', name: 'Nebula Economy', price: 45.00, color: '#00BFFF' }, // Deep Sky Blue
    ],
    sessions: [
        {
            id: 'ses_1',
            startTime: new Date(new Date().setDate(new Date().getDate() + 10)).toISOString(),
            endTime: new Date(new Date().setDate(new Date().getDate() + 10) + 2 * 60 * 60 * 1000).toISOString(),
            salesStartTime: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(),
            status: 'ON_SALE',
            layoutData: {
                name: 'Main Auditorium',
                layout: {
                    blocks: [{
                        id: 'block_a',
                        name: 'Orchestra',
                        type: 'seated',
                        rows: [
                            { id: 'row_a1', label: 'A', seats: Array.from({ length: 10 }, (_, i) => ({ id: `s_a1_${i}`, label: `${i + 1}`, status: i < 3 ? 'BOOKED' : (i < 4 ? 'LOCKED' : 'AVAILABLE'), tier: { id: 'tier_1', name: 'Starlight VIP', price: 150.00, color: '#FFD700' } })) },
                            { id: 'row_a2', label: 'B', seats: Array.from({ length: 12 }, (_, i) => ({ id: `s_a2_${i}`, label: `${i + 1}`, status: i < 6 ? 'BOOKED' : 'AVAILABLE', tier: { id: 'tier_2', name: 'Galaxy General', price: 75.00, color: '#8A2BE2' } })) }
                        ]
                    }, {
                        id: 'block_b',
                        name: 'Mezzanine',
                        type: 'seated',
                        rows: [
                            { id: 'row_b1', label: 'C', seats: Array.from({ length: 15 }, (_, i) => ({ id: `s_b1_${i}`, label: `${i + 1}`, status: i < 11 ? 'BOOKED' : 'AVAILABLE', tier: { id: 'tier_3', name: 'Nebula Economy', price: 45.00, color: '#00BFFF' } })) }
                        ]
                    }]
                }
            },
            venueDetails: { name: 'Apollo Theater', address: '123 Main St', onlineLink: null, location: null }
        },
        {
            id: 'ses_2',
            startTime: new Date(new Date().setDate(new Date().getDate() + 11)).toISOString(),
            endTime: new Date(new Date().setDate(new Date().getDate() + 11) + 2 * 60 * 60 * 1000).toISOString(),
            salesStartTime: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString(),
            status: 'ON_SALE',
            layoutData: {
                name: 'Main Auditorium',
                layout: {
                    blocks: [{
                        id: 'block_a_s2',
                        name: 'Orchestra',
                        type: 'seated',
                        rows: [
                            { id: 'row_a1_s2', label: 'A', seats: Array.from({ length: 10 }, (_, i) => ({ id: `s2_a1_${i}`, label: `${i + 1}`, status: i < 8 ? 'BOOKED' : 'AVAILABLE', tier: { id: 'tier_1', name: 'Starlight VIP', price: 150.00, color: '#FFD700' } })) },
                            { id: 'row_a2_s2', label: 'B', seats: Array.from({ length: 12 }, (_, i) => ({ id: `s2_a2_${i}`, label: `${i + 1}`, status: 'BOOKED', tier: { id: 'tier_2', name: 'Galaxy General', price: 75.00, color: '#8A2BE2' } })) }
                        ]
                    }, {
                        id: 'block_b_s2',
                        name: 'Mezzanine',
                        type: 'seated',
                        rows: [
                            { id: 'row_b1_s2', label: 'C', seats: Array.from({ length: 15 }, (_, i) => ({ id: `s2_b1_${i}`, label: `${i + 1}`, status: i < 5 ? 'BOOKED' : 'AVAILABLE', tier: { id: 'tier_3', name: 'Nebula Economy', price: 45.00, color: '#00BFFF' } })) }
                        ]
                    }]
                }
            },
            venueDetails: { name: 'Apollo Theater', address: '123 Main St', onlineLink: null, location: null }
        },
        {
            id: 'ses_3',
            startTime: new Date(new Date().setDate(new Date().getDate() + 15)).toISOString(),
            endTime: new Date(new Date().setDate(new Date().getDate() + 15) + 2 * 60 * 60 * 1000).toISOString(),
            salesStartTime: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString(),
            status: 'SOLD_OUT',
            layoutData: {
                name: 'IMAX Screening',
                layout: {
                    blocks: [{
                        id: 'block_a_s3',
                        name: 'Premium Seating',
                        type: 'seated',
                        rows: [
                            { id: 'row_a1_s3', label: 'A', seats: Array.from({ length: 20 }, (_, i) => ({ id: `s3_a1_${i}`, label: `${i + 1}`, status: 'BOOKED', tier: { id: 'tier_2', name: 'Galaxy General', price: 75.00, color: '#8A2BE2' } })) }
                        ]
                    }]
                }
            },
            venueDetails: { name: 'IMAX Cinema', address: '456 Cinema Blvd', onlineLink: null, location: null }
        }
    ],
    description: 'An immersive cinematic experience with a live orchestral score.',
    overview: 'Experience the magic of Interstellar like never before.',
    coverPhotos: ['/interstellar_cover.jpg']
};

// --- Helper Functions ---
const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
const formatDateTime = (dateString) => format(parseISO(dateString), 'MMM do, yyyy h:mm a');
const formatDateOnly = (dateString) => format(parseISO(dateString), 'MMM do, yyyy');


const AnalyticsDashboard = () => {
    const [eventData] = useState(mockEventData);
    const [analytics, setAnalytics] = useState(null);
    const [selectedSession, setSelectedSession] = useState(null);

    // Calculate analytics when component mounts or data changes
    useEffect(() => {
        if (!eventData) return;

        const getAllSeats = (session) => session.layoutData?.layout?.blocks?.flatMap(b => b.rows ? b.rows.flatMap(r => r.seats) : (b.seats || [])) || [];

        const sessionDetails = eventData.sessions.map(session => {
            const allSeats = getAllSeats(session);
            const ticketsSold = allSeats.filter(s => s.status === 'BOOKED').length;
            const totalTickets = allSeats.length;
            const revenue = allSeats
                .filter(s => s.status === 'BOOKED')
                .reduce((sum, seat) => sum + (seat.tier?.price || 0), 0);
            const sellOutPercentage = totalTickets > 0 ? (ticketsSold / totalTickets) * 100 : 0;

            const salesByTier = allSeats
                .filter(s => s.status === 'BOOKED')
                .reduce((acc, seat) => {
                    const tierName = seat.tier?.name || 'Unknown Tier';
                    if (!acc[tierName]) {
                        acc[tierName] = { count: 0, revenue: 0, color: seat.tier?.color || '#cccccc' }; // Default color
                    }
                    acc[tierName].count++;
                    acc[tierName].revenue += (seat.tier?.price || 0);
                    return acc;
                }, {});

            return { ...session, ticketsSold, totalTickets, revenue, sellOutPercentage, salesByTier };
        });

        const totalRevenue = sessionDetails.reduce((sum, s) => sum + s.revenue, 0);
        const totalTicketsSold = sessionDetails.reduce((sum, s) => sum + s.ticketsSold, 0);
        const totalCapacity = sessionDetails.reduce((sum, s) => sum + s.totalTickets, 0);
        const overallSellOut = totalCapacity > 0 ? (totalTicketsSold / totalCapacity) * 100 : 0;

        setAnalytics({
            totalRevenue,
            totalTicketsSold,
            overallSellOut: overallSellOut.toFixed(1),
            activeSessions: eventData.sessions.filter(s => s.status === 'ON_SALE').length,
            sessionDetails
        });
    }, [eventData]);

    if (!analytics) {
        return <div className="p-8 text-center text-foreground">Loading analytics...</div>;
    }

    // --- Session Detail View ---
    if (selectedSession) {
        const tierSalesData = Object.entries(selectedSession.salesByTier).map(([name, data]) => ({ name, ...data }));
        const hasSalesData = tierSalesData.some(tier => tier.count > 0);

        return (
            <div className="p-4 md:p-8 max-w-7xl mx-auto animate-fade-in">
                <Button
                    variant="ghost"
                    onClick={() => setSelectedSession(null)}
                    className="mb-6 text-sm text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Event Summary
                </Button>
                <div className="mb-6">
                    <h1 className="text-3xl font-bold">Session Analytics</h1>
                    <p className="text-muted-foreground">{eventData.title} - {formatDateTime(selectedSession.startTime)}</p>
                </div>

                {/* Session Summary Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle>Total Revenue</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(selectedSession.revenue)}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle>Tickets Sold</CardTitle>
                            <Ticket className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{selectedSession.ticketsSold} / {selectedSession.totalTickets}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle>Sell-Out Percentage</CardTitle>
                            <Percent className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{selectedSession.sellOutPercentage.toFixed(1)}%</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle>Session Status</CardTitle>
                            <CalendarDays className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <Badge variant={selectedSession.status === 'SOLD_OUT' ? 'destructive' : 'default'}>
                                {selectedSession.status.replace('_', ' ')}
                            </Badge>
                        </CardContent>
                    </Card>
                </div>

                {/* Sales by Tier Pie Chart */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <PieChartIcon className="h-5 w-5" /> Sales Distribution by Ticket Tier
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {hasSalesData ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={tierSalesData}
                                        dataKey="revenue"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={100}
                                        fill="#8884d8"
                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {tierSalesData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => formatCurrency(value)} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-muted-foreground text-center py-10">No sales data available for this session.</p>
                        )}
                    </CardContent>
                </Card>

                {/* Other Session Details (e.g., Venue, Seating Overview) */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5" /> Seating Overview
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-2">Venue: {selectedSession.venueDetails?.name}</p>
                        <p className="text-sm text-muted-foreground mb-4">Map: {selectedSession.layoutData?.name}</p>
                        {selectedSession.layoutData?.layout?.blocks.map(block => (
                            <div key={block.id} className="mb-4 p-3 border rounded-md">
                                <h4 className="font-semibold text-lg">{block.name}</h4>
                                <p className="text-sm text-muted-foreground">Type: {block.type}</p>
                                <p className="text-sm">Total Seats: {block.rows ? block.rows.flatMap(row => row.seats).length : (block.seats ? block.seats.length : 0)}</p>
                                {/* You can add more detailed seat status per block here */}
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        );
    }

    // --- Main Dashboard View (Event Summary) ---
    const sessionSalesData = analytics.sessionDetails.map(s => ({
        name: formatDateOnly(s.startTime),
        'Tickets Sold': s.ticketsSold,
        'Total Capacity': s.totalTickets,
    }));

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto animate-fade-in">
            <div className="mb-8">
                <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">{eventData.title}</h1>
                <p className="text-muted-foreground text-lg">Comprehensive Booking Analytics</p>
            </div>

            {/* Event Summary Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle>Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(analytics.totalRevenue)}</div>
                        <p className="text-xs text-muted-foreground">Across all sessions</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle>Tickets Sold</CardTitle>
                        <Ticket className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics.totalTicketsSold.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Total capacity filled</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle>Overall Sell-Out</CardTitle>
                        <Percent className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics.overallSellOut}%</div>
                        <p className="text-xs text-muted-foreground">Average across all sessions</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle>Active Sessions</CardTitle>
                        <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics.activeSessions} / {eventData.sessions.length}</div>
                        <p className="text-xs text-muted-foreground">Sessions currently on sale</p>
                    </CardContent>
                </Card>
            </div>

            {/* Bar Chart: Tickets Sold per Session */}
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" /> Tickets Sold Per Session
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={sessionSalesData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                            <XAxis dataKey="name" tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} />
                            <YAxis tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} />
                            <Tooltip cursor={{ fill: 'var(--accent)', opacity: 0.1 }} />
                            <Legend />
                            <Bar dataKey="Tickets Sold" fill="var(--primary)" />
                            <Bar dataKey="Total Capacity" fill="var(--secondary)" opacity={0.6} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Sessions Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">Session Performance Overview</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Session Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Tickets Sold</TableHead>
                                <TableHead className="text-right">Revenue</TableHead>
                                <TableHead>Sell-Out Progress</TableHead>
                                <TableHead>Details</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {analytics.sessionDetails.map(session => (
                                <TableRow
                                    key={session.id}
                                    className="cursor-pointer transition-colors hover:bg-muted/50"
                                    onClick={() => setSelectedSession(session)}
                                >
                                    <TableCell className="font-medium">
                                        {formatDateTime(session.startTime)}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={session.status === 'SOLD_OUT' ? 'destructive' : 'default'}>
                                            {session.status.replace('_', ' ')}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {session.ticketsSold} / {session.totalTickets}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {formatCurrency(session.revenue)}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Progress value={session.sellOutPercentage} className="w-[100px]" />
                                            <span className="text-sm text-muted-foreground w-10 text-right">
                                                {session.sellOutPercentage.toFixed(0)}%
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="sm">
                                            View <ArrowLeft className="ml-2 h-3 w-3 rotate-180" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default AnalyticsDashboard;