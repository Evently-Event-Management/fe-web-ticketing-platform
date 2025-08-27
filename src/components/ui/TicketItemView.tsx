'use client';

import React from 'react';
import { Ticket } from 'lucide-react';
import { SelectedSeat } from '@/app/(home-app)/events/[event_id]/[session_id]/_components/SessionBooking';

interface TicketItemViewProps {
  seat: SelectedSeat;
  variant?: 'list' | 'compact';
  onRemove?: (seatId: string) => void;
  showRemoveButton?: boolean;
}

const TicketItemView: React.FC<TicketItemViewProps> = ({
  seat,
  variant = 'list',
  onRemove,
  showRemoveButton = false
}) => {
  const formattedPrice = new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 0
  }).format(seat.tier.price);

  if (variant === 'compact') {
    return (
      <div className="flex justify-between items-center border-b pb-2">
        <div>
          <p className="font-medium">{seat.label}</p>
          <p className="text-xs text-muted-foreground">{seat.tier.name} - {seat.blockName}</p>
        </div>
        <p className="font-mono">
          {formattedPrice}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-muted/40 border rounded-lg flex overflow-hidden transition-all hover:shadow-md">
      {/* Left "Stub" with Ticket Icon and Tier Color */}
      <div
        className="relative flex items-center justify-center p-4"
        style={{backgroundColor: `${seat.tier.color}20`}}
      >
        <Ticket className="h-7 w-7" style={{color: seat.tier.color}}/>
      </div>

      {/* Dashed Separator */}
      <div className="border-l-2 border-dashed border-muted"/>

      {/* Right "Details" section */}
      <div className="flex-grow p-3 flex justify-between items-center">
        <div>
          <p className="font-bold text-foreground">Seat {seat.label}</p>
          <p className="text-sm text-muted-foreground">{seat.tier.name} - {seat.blockName}</p>
        </div>
        <div className="flex items-center gap-2">
          <p className="font-mono font-semibold text-foreground text-sm">
            {formattedPrice}
          </p>
          {showRemoveButton && onRemove && (
            <button
              className="h-7 w-7 flex items-center justify-center text-muted-foreground rounded-full hover:bg-destructive/10 hover:text-destructive"
              onClick={() => onRemove(seat.id)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6 6 18"/>
                <path d="m6 6 12 12"/>
              </svg>
              <span className="sr-only">Remove seat</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketItemView;
