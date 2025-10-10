'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Copy, CheckCircle } from 'lucide-react';
import QRCode from 'qrcode';
import { Ticket } from '@/types/order';
import Image from 'next/image';

interface QRCodeModalProps {
    ticket: Ticket | null;
    isOpen: boolean;
    onClose: () => void;
}

export const QRCodeModal = ({ ticket, isOpen, onClose }: QRCodeModalProps) => {
    const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (ticket && isOpen) {
            // Generate QR code with ticket information
            const ticketData = {
                ticketId: ticket.TicketID,
                eventName: ticket.EventName,
                seatId: ticket.SeatID,
                eventId: ticket.EventID,
                sessionId: ticket.SessionID,
                validUntil: ticket.ValidUntil,
                qrCode: ticket.QRCode
            };

            QRCode.toDataURL(JSON.stringify(ticketData), {
                width: 300,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                }
            })
            .then(url => {
                setQrCodeUrl(url);
            })
            .catch(err => {
                console.error('Error generating QR code:', err);
            });
        }
    }, [ticket, isOpen]);

    const handleCopyTicketId = async () => {
        if (ticket) {
            await navigator.clipboard.writeText(ticket.TicketID);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleDownloadQR = () => {
        if (qrCodeUrl && ticket) {
            const link = document.createElement('a');
            link.download = `ticket-${ticket.TicketID.slice(-8)}-qr.png`;
            link.href = qrCodeUrl;
            link.click();
        }
    };

    if (!ticket) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <span>Ticket QR Code</span>
                    </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-6">
                    {/* Ticket Info */}
                    <div className="text-center space-y-2">
                        <h3 className="font-semibold text-lg">{ticket.EventName}</h3>
                        <p className="text-muted-foreground">{ticket.VenueName}</p>
                        <div className="flex justify-center gap-4 text-sm">
                            <span>{ticket.SessionDate ? new Date(ticket.SessionDate).toLocaleDateString() : ''}</span>
                            <span>{ticket.SessionTime}</span>
                        </div>
                        <div className="text-sm">
                            Seat: {ticket.SeatRow ? `${ticket.SeatRow}${ticket.SeatNumber}` : ticket.SeatID}
                        </div>
                    </div>

                    {/* QR Code */}
                    <div className="flex justify-center">
                        {qrCodeUrl ? (
                            <div className="p-4 bg-white rounded-lg border">
                                <Image 
                                    src={qrCodeUrl} 
                                    alt="Ticket QR Code" 
                                    width={192}
                                    height={192}
                                    className="w-48 h-48"
                                />
                            </div>
                        ) : (
                            <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                                <span className="text-gray-500">Generating QR Code...</span>
                            </div>
                        )}
                    </div>

                    {/* Ticket ID */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Ticket ID</label>
                        <div className="flex items-center gap-2">
                            <code className="flex-1 p-2 bg-muted rounded text-sm font-mono">
                                {ticket.TicketID}
                            </code>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleCopyTicketId}
                                className="flex items-center gap-1"
                            >
                                {copied ? (
                                    <>
                                        <CheckCircle className="h-4 w-4" />
                                        Copied
                                    </>
                                ) : (
                                    <>
                                        <Copy className="h-4 w-4" />
                                        Copy
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={handleDownloadQR}
                            disabled={!qrCodeUrl}
                            className="flex-1"
                        >
                            <Download className="h-4 w-4 mr-2" />
                            Download QR
                        </Button>
                        <Button
                            onClick={onClose}
                            className="flex-1"
                        >
                            Close
                        </Button>
                    </div>

                    {/* Instructions */}
                    <div className="text-xs text-muted-foreground text-center space-y-1">
                        <p>Present this QR code at the event entrance</p>
                        <p>Valid until: {new Date(ticket.ValidUntil).toLocaleDateString()}</p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};