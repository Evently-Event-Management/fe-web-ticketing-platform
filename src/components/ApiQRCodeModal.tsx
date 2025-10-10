'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Copy, CheckCircle, QrCode } from 'lucide-react';
import { ApiTicket } from '@/types/order';
import Image from 'next/image';

interface ApiQRCodeModalProps {
    ticket: ApiTicket | null;
    isOpen: boolean;
    onClose: () => void;
}

export const ApiQRCodeModal = ({ ticket, isOpen, onClose }: ApiQRCodeModalProps) => {
    const [copied, setCopied] = useState(false);

    const handleCopyTicketId = async () => {
        if (ticket) {
            await navigator.clipboard.writeText(ticket.ticket_id);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleDownloadQR = () => {
        if (ticket && ticket.qr_code) {
            try {
                // Create a data URL from the base64 encoded QR code
                const qrDataUrl = `data:image/png;base64,${ticket.qr_code}`;
                
                // Create a temporary link and download the image
                const link = document.createElement('a');
                link.download = `ticket-${ticket.ticket_id.slice(-8)}-qr.png`;
                link.href = qrDataUrl;
                link.click();
            } catch (error) {
                console.error('Error downloading QR code:', error);
            }
        }
    };

    if (!ticket) return null;

    // Create data URL for the QR code image
    const qrCodeUrl = ticket.qr_code ? `data:image/png;base64,${ticket.qr_code}` : null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <QrCode className="h-5 w-5" />
                        <span>Ticket QR Code</span>
                    </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-6">
                    {/* Ticket Info */}
                    <div className="text-center space-y-2">
                        <h3 className="font-semibold text-lg">Seat {ticket.seat_label}</h3>
                        <p className="text-muted-foreground">{ticket.tier_name} Tier</p>
                        <div className="flex justify-center items-center gap-2 text-sm">
                            <div 
                                className="w-3 h-3 rounded-full border"
                                style={{ backgroundColor: ticket.colour.toLowerCase() }}
                            ></div>
                            <span>{ticket.colour}</span>
                        </div>
                        <div className="text-sm">
                            Price: ${ticket.price_at_purchase.toFixed(2)}
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
                                <span className="text-gray-500">QR Code not available</span>
                            </div>
                        )}
                    </div>

                    {/* Ticket ID */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Ticket ID</label>
                        <div className="flex items-center gap-2">
                            <code className="flex-1 p-2 bg-muted rounded text-sm font-mono">
                                {ticket.ticket_id}
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

                    {/* Status Info */}
                    <div className="p-3 bg-muted rounded-lg">
                        <div className="flex items-center justify-between text-sm">
                            <span>Status:</span>
                            <span className={`font-medium ${ticket.checked_in ? 'text-blue-600' : 'text-green-600'}`}>
                                {ticket.checked_in ? 'Used' : 'Valid'}
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-sm mt-1">
                            <span>Issued:</span>
                            <span>{new Date(ticket.issued_at).toLocaleDateString()}</span>
                        </div>
                        {ticket.checked_in && ticket.checked_in_time !== "0001-01-01T00:00:00Z" && (
                            <div className="flex items-center justify-between text-sm mt-1">
                                <span>Checked in:</span>
                                <span>{new Date(ticket.checked_in_time).toLocaleString()}</span>
                            </div>
                        )}
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
                        <p>Keep this ticket until after the event</p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};