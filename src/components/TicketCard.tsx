'use client';

import { useState } from 'react';
import { Ticket, TicketStatus } from '@/types/order';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
    QrCode, 
    Calendar, 
    MapPin, 
    Clock, 
    Users, 
    Ticket as TicketIcon,
    ChevronDown,
    ChevronUp,
    Download,
    Eye
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { QRCodeModal } from './QRCodeModal';
import { generateTicketPDF, downloadAllTickets } from '@/lib/ticketPDF';

interface TicketCardProps {
    ticket: Ticket;
}

interface TicketsListProps {
    tickets: Ticket[];
    orderStatus: string;
}

export const TicketCard = ({ ticket }: TicketCardProps) => {
    const [qrModalOpen, setQrModalOpen] = useState(false);

    const getTicketStatusVariant = (status: TicketStatus) => {
        switch (status) {
            case TicketStatus.VALID:
                return 'default';
            case TicketStatus.USED:
                return 'secondary';
            case TicketStatus.EXPIRED:
                return 'outline';
            case TicketStatus.CANCELLED:
                return 'destructive';
            default:
                return 'secondary';
        }
    };

    const getTicketStatusColor = (status: TicketStatus) => {
        switch (status) {
            case TicketStatus.VALID:
                return 'text-white';
            case TicketStatus.USED:
                return 'text-blue-600';
            case TicketStatus.EXPIRED:
                return 'text-gray-500';
            case TicketStatus.CANCELLED:
                return 'text-red-500';
            default:
                return 'text-gray-500';
        }
    };

    return (
        <Card className="border-l-4 border-l-primary/20 hover:border-l-primary/40 transition-colors">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <TicketIcon className="h-5 w-5 text-primary" />
                        <div>
                            <CardTitle className="text-base">
                                Ticket #{ticket.TicketID.slice(-8)}
                            </CardTitle>
                            <div className="flex items-center gap-2 mt-1">
                                <Badge 
                                    variant={getTicketStatusVariant(ticket.Status)} 
                                    className={getTicketStatusColor(ticket.Status)}
                                >
                                    {ticket.Status}
                                </Badge>
                                {ticket.TicketType && (
                                    <Badge variant="outline">{ticket.TicketType}</Badge>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-lg font-bold">${ticket.Price.toFixed(2)}</div>
                        <div className="text-xs text-muted-foreground">Ticket Price</div>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <div className="text-sm font-medium">Seat</div>
                                <div className="text-sm text-muted-foreground">
                                    {ticket.SeatRow ? `Row ${ticket.SeatRow}, ` : ''}
                                    Seat {ticket.SeatNumber || ticket.SeatID}
                                </div>
                            </div>
                        </div>
                        
                        {ticket.EventName && (
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <div className="text-sm font-medium">Event</div>
                                    <div className="text-sm text-muted-foreground">{ticket.EventName}</div>
                                </div>
                            </div>
                        )}
                        
                        {ticket.VenueName && (
                            <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <div className="text-sm font-medium">Venue</div>
                                    <div className="text-sm text-muted-foreground">{ticket.VenueName}</div>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <div className="space-y-3">
                        {ticket.SessionDate && (
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <div className="text-sm font-medium">Date</div>
                                    <div className="text-sm text-muted-foreground">
                                        {new Date(ticket.SessionDate).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {ticket.SessionTime && (
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <div className="text-sm font-medium">Time</div>
                                    <div className="text-sm text-muted-foreground">{ticket.SessionTime}</div>
                                </div>
                            </div>
                        )}
                        
                        <div className="flex items-center gap-2">
                            <QrCode className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <div className="text-sm font-medium">Valid Until</div>
                                <div className="text-sm text-muted-foreground">
                                    {new Date(ticket.ValidUntil).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* QR Code and Actions */}
                <div className="border-t pt-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <QrCode className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground font-mono">
                                QR: {ticket.QRCode.slice(-12)}
                            </span>
                        </div>
                        
                        <div className="flex gap-2">
                            {ticket.Status === TicketStatus.VALID && (
                                <>
                                    <Button 
                                        size="sm" 
                                        variant="outline"
                                        onClick={() => setQrModalOpen(true)}
                                    >
                                        <Eye className="h-4 w-4 mr-1" />
                                        View QR
                                    </Button>
                                    <Button 
                                        size="sm"
                                        onClick={() => generateTicketPDF(ticket)}
                                    >
                                        <Download className="h-4 w-4 mr-1" />
                                        Download
                                    </Button>
                                </>
                            )}
                            {ticket.Status === TicketStatus.USED && (
                                <Button size="sm" variant="secondary" disabled>
                                    Ticket Used
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
            
            {/* QR Code Modal */}
            <QRCodeModal 
                ticket={ticket}
                isOpen={qrModalOpen}
                onClose={() => setQrModalOpen(false)}
            />
        </Card>
    );
};

export const TicketsList = ({ tickets, orderStatus }: TicketsListProps) => {
    const [isOpen, setIsOpen] = useState(false);
    
    const validTickets = tickets.filter(ticket => ticket.Status === TicketStatus.VALID);

    if (tickets.length === 0) {
        return null;
    }

    return (
        <div className="mt-4">
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                <div className="flex items-center justify-between">
                    <CollapsibleTrigger asChild>
                        <Button 
                            variant="ghost" 
                            className="flex-1 justify-between p-0 h-auto text-left hover:bg-transparent"
                        >
                            <div className="flex items-center gap-2">
                                <TicketIcon className="h-4 w-4" />
                                <span className="font-medium">
                                    View Tickets ({tickets.length})
                                </span>
                            </div>
                            {isOpen ? (
                                <ChevronUp className="h-4 w-4" />
                            ) : (
                                <ChevronDown className="h-4 w-4" />
                            )}
                        </Button>
                    </CollapsibleTrigger>
                    
                    {orderStatus === 'completed' && validTickets.length > 1 && (
                        <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => downloadAllTickets(validTickets)}
                            className="ml-2"
                        >
                            <Download className="h-4 w-4 mr-1" />
                            Download All
                        </Button>
                    )}
                </div>
                
                <CollapsibleContent className="space-y-3 mt-3">
                    <div className="text-xs text-muted-foreground mb-3">
                        {orderStatus === 'completed' 
                            ? 'Your tickets are ready to use' 
                            : `Tickets will be available when order is completed`}
                    </div>
                    
                    {orderStatus === 'completed' ? (
                        <div className="space-y-3">
                            {tickets.map((ticket) => (
                                <TicketCard key={ticket.TicketID} ticket={ticket} />
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {tickets.map((ticket, index) => (
                                <div 
                                    key={ticket.TicketID} 
                                    className="flex items-center gap-3 p-3 border border-dashed rounded-lg opacity-50"
                                >
                                    <TicketIcon className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <div className="text-sm font-medium">
                                            Ticket #{index + 1} - Seat {ticket.SeatID}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            Will be available after payment completion
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CollapsibleContent>
            </Collapsible>
        </div>
    );
};