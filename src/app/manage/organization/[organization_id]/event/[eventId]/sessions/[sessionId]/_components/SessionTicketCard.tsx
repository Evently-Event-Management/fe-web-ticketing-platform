import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { TicketResponse } from "@/lib/actions/analyticsActions";
import { format, parseISO } from "date-fns";
import { CheckCircle2, CircleDashed, Hash, Ticket as TicketIcon } from "lucide-react";

interface SessionTicketCardProps {
  ticket: TicketResponse;
}

const SENTINEL_DATE = "0001-01-01T00:00:00Z";

const formatDateTime = (value?: string) => {
  if (!value || value === SENTINEL_DATE) {
    return "—";
  }

  try {
    return format(parseISO(value), "PPpp");
  } catch {
    return value;
  }
};

export function SessionTicketCard({ ticket }: SessionTicketCardProps) {
  const checkedInVariant = ticket.checked_in ? "default" : "outline";
  const checkedInLabel = ticket.checked_in ? "Checked In" : "Not Checked In";
  const StatusIcon = ticket.checked_in ? CheckCircle2 : CircleDashed;

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-lg font-semibold">Seat {ticket.seat_label}</CardTitle>
          <CardDescription className="flex items-center gap-2">
            <TicketIcon className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-foreground">{ticket.tier_name}</span>
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground">${ticket.price_at_purchase.toFixed(2)}</span>
          </CardDescription>
        </div>
        <Badge
          variant={checkedInVariant}
          className={ticket.checked_in ? "bg-emerald-500 hover:bg-emerald-500/90" : "text-muted-foreground"}
        >
          <span className="flex items-center gap-1.5">
            <StatusIcon className="h-3.5 w-3.5" />
            {checkedInLabel}
          </span>
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Order</span>
          <span className="font-medium text-foreground flex items-center gap-1">
            <Hash className="h-4 w-4 text-muted-foreground" />
            {ticket.order_id}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Seat ID</span>
          <span className="font-medium text-foreground">{ticket.seat_id}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Issued At</span>
          <span className="font-medium text-foreground">{formatDateTime(ticket.issued_at)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Checked In At</span>
          <span className="font-medium text-foreground">{formatDateTime(ticket.checked_in_time)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Colour</span>
          <span className="flex items-center gap-2 font-medium text-foreground">
            <span
              className="h-4 w-4 rounded-full border"
              style={{ backgroundColor: ticket.colour }}
              aria-hidden="true"
            />
            {ticket.colour}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
