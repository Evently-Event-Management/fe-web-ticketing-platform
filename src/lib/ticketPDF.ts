import { Ticket } from '@/types/order';
import QRCode from 'qrcode';

export const generateTicketPDF = async (ticket: Ticket): Promise<void> => {
    try {
        // Generate QR code
        const ticketData = {
            ticketId: ticket.TicketID,
            eventName: ticket.EventName,
            seatId: ticket.SeatID,
            eventId: ticket.EventID,
            sessionId: ticket.SessionID,
            validUntil: ticket.ValidUntil,
            qrCode: ticket.QRCode
        };

        const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(ticketData), {
            width: 200,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        });

        // Create a simple HTML ticket template
        const ticketHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Ticket - ${ticket.EventName}</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 0;
                        padding: 20px;
                        background-color: #f5f5f5;
                    }
                    .ticket {
                        max-width: 600px;
                        margin: 0 auto;
                        background: white;
                        border-radius: 12px;
                        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                        overflow: hidden;
                    }
                    .ticket-header {
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        padding: 30px;
                        text-align: center;
                    }
                    .event-name {
                        font-size: 28px;
                        font-weight: bold;
                        margin: 0 0 10px 0;
                    }
                    .venue-name {
                        font-size: 18px;
                        opacity: 0.9;
                        margin: 0;
                    }
                    .ticket-body {
                        padding: 30px;
                        display: grid;
                        grid-template-columns: 1fr auto;
                        gap: 30px;
                        align-items: center;
                    }
                    .ticket-details {
                        display: grid;
                        gap: 15px;
                    }
                    .detail-row {
                        display: grid;
                        grid-template-columns: 120px 1fr;
                        gap: 10px;
                        padding: 8px 0;
                        border-bottom: 1px solid #eee;
                    }
                    .detail-label {
                        font-weight: bold;
                        color: #666;
                    }
                    .detail-value {
                        color: #333;
                    }
                    .qr-section {
                        text-align: center;
                    }
                    .qr-code {
                        border: 2px solid #ddd;
                        border-radius: 8px;
                        padding: 10px;
                        background: white;
                    }
                    .qr-instructions {
                        margin-top: 10px;
                        font-size: 12px;
                        color: #666;
                        line-height: 1.4;
                    }
                    .ticket-footer {
                        background: #f8f9fa;
                        padding: 20px 30px;
                        border-top: 1px solid #eee;
                        text-align: center;
                        font-size: 12px;
                        color: #666;
                    }
                    .ticket-id {
                        font-family: monospace;
                        background: #f0f0f0;
                        padding: 2px 6px;
                        border-radius: 4px;
                    }
                    @media print {
                        body { background-color: white; }
                        .ticket { box-shadow: none; }
                    }
                </style>
            </head>
            <body>
                <div class="ticket">
                    <div class="ticket-header">
                        <h1 class="event-name">${ticket.EventName || 'Event'}</h1>
                        <p class="venue-name">${ticket.VenueName || 'Venue'}</p>
                    </div>
                    
                    <div class="ticket-body">
                        <div class="ticket-details">
                            <div class="detail-row">
                                <span class="detail-label">Date:</span>
                                <span class="detail-value">${ticket.SessionDate ? new Date(ticket.SessionDate).toLocaleDateString() : 'TBD'}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Time:</span>
                                <span class="detail-value">${ticket.SessionTime || 'TBD'}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Seat:</span>
                                <span class="detail-value">${ticket.SeatRow ? `Row ${ticket.SeatRow}, ` : ''}Seat ${ticket.SeatNumber || ticket.SeatID}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Type:</span>
                                <span class="detail-value">${ticket.TicketType || 'Standard'}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Price:</span>
                                <span class="detail-value">$${ticket.Price.toFixed(2)}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Valid Until:</span>
                                <span class="detail-value">${new Date(ticket.ValidUntil).toLocaleDateString()}</span>
                            </div>
                        </div>
                        
                        <div class="qr-section">
                            <img src="${qrCodeDataUrl}" alt="QR Code" class="qr-code" />
                            <div class="qr-instructions">
                                Present this QR code<br>
                                at the event entrance
                            </div>
                        </div>
                    </div>
                    
                    <div class="ticket-footer">
                        <p>Ticket ID: <span class="ticket-id">${ticket.TicketID}</span></p>
                        <p>Keep this ticket safe. Digital or printed copy required for entry.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        // Create a new window with the ticket HTML
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(ticketHTML);
            printWindow.document.close();
            
            // Wait for images to load then trigger print
            printWindow.onload = () => {
                setTimeout(() => {
                    printWindow.print();
                    printWindow.close();
                }, 500);
            };
        }
    } catch (error) {
        console.error('Error generating ticket PDF:', error);
        alert('Error generating ticket. Please try again.');
    }
};

export const downloadAllTickets = async (tickets: Ticket[]): Promise<void> => {
    try {
        for (let i = 0; i < tickets.length; i++) {
            await generateTicketPDF(tickets[i]);
            // Add a small delay between downloads to prevent browser blocking
            if (i < tickets.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
    } catch (error) {
        console.error('Error downloading all tickets:', error);
        alert('Error downloading tickets. Please try again.');
    }
};