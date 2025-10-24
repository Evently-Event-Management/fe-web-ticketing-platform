'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import { useEventContext } from '@/providers/EventProvider'
import { getSessionTickets, type TicketResponse } from '@/lib/actions/analyticsActions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { SessionTicketCard } from '../_components/SessionTicketCard'
import { toast } from 'sonner'
import { format, parse, parseISO } from 'date-fns'
import { AlertCircle } from 'lucide-react'
import { ChartContainer, ChartConfig, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { PieChart, Pie, Cell, LineChart, Line, CartesianGrid, XAxis, YAxis } from 'recharts'

const SENTINEL_DATE = '0001-01-01T00:00:00Z'

export default function SessionTicketsPage() {
  const params = useParams()
  const sessionId = params.sessionId as string
  const { event } = useEventContext()

  const [tickets, setTickets] = useState<TicketResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const session = event?.sessions.find((s) => s.id === sessionId)

  useEffect(() => {
    const fetchTickets = async () => {
      if (!sessionId) return
      setIsLoading(true)
      setError(null)

      try {
        const data = await getSessionTickets(sessionId)
        setTickets(data)
      } catch (err) {
        console.error('Failed to fetch session tickets:', err)
        const message = err instanceof Error ? err.message : 'Failed to fetch tickets. Please try again.'
        setError(message)
        toast.error(message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTickets()
  }, [sessionId])

  const stats = useMemo(() => {
    const total = tickets.length
    const checkedIn = tickets.filter((ticket) => ticket.checked_in).length
    const notCheckedIn = total - checkedIn

    return { total, checkedIn, notCheckedIn }
  }, [tickets])

  const statusChartData = useMemo(() => {
    const data = [
      {
        key: 'checkedIn',
        label: 'Checked In',
        count: stats.checkedIn,
        color: 'var(--color-chart-2)'
      },
      {
        key: 'notCheckedIn',
        label: 'Not Checked In',
        count: stats.notCheckedIn,
        color: 'var(--color-chart-5)'
      }
    ]

    return data.filter(item => item.count > 0)
  }, [stats.checkedIn, stats.notCheckedIn])

  const statusChartConfig = useMemo<ChartConfig>(() => ({
    checkedIn: {
      label: 'Checked In',
      color: 'var(--color-chart-2)'
    },
    notCheckedIn: {
      label: 'Not Checked In',
      color: 'var(--color-chart-5)'
    }
  }), [])

  const attendanceChartData = useMemo(() => {
    const counts = new Map<string, number>()

    tickets.forEach((ticket) => {
      if (!ticket.checked_in || !ticket.checked_in_time || ticket.checked_in_time === SENTINEL_DATE) {
        return
      }

      try {
        const dateKey = format(parseISO(ticket.checked_in_time), 'yyyyMMdd')
        counts.set(dateKey, (counts.get(dateKey) ?? 0) + 1)
      } catch {
        // Swallow parse errors and skip invalid dates
      }
    })

    return Array.from(counts.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({
        date,
        attendance: count
      }))
  }, [tickets])

  const attendanceChartConfig = useMemo<ChartConfig>(() => ({
    attendance: {
      label: 'Attendance',
      color: 'var(--color-chart-1)'
    }
  }), [])

  const sessionStartLabel = useMemo(() => {
    if (!session?.startTime) return null
    try {
      return format(parseISO(session.startTime), 'PPpp')
    } catch {
      return session.startTime
    }
  }, [session?.startTime])

  if (!event) {
    return (
      <div className="p-8 text-center w-full">
        Event Not Found
      </div>
    )
  }

  if (!session) {
    return (
      <div className="p-8 text-center w-full">
        Session Not Found
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Session Tickets</h1>
        <p className="text-muted-foreground">
          Viewing tickets for {event.title} · {sessionStartLabel ?? 'Scheduled Session'}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Checked In</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-emerald-600">{stats.checkedIn}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Not Checked In</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-amber-600">{stats.notCheckedIn}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Ticket Status Mix</CardTitle>
            <CardDescription>
              {stats.total === 0 ? 'No tickets issued yet' : `${stats.total} tickets across this session`}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex h-[320px] flex-col items-center justify-center">
            {isLoading ? (
              <Skeleton className="h-[220px] w-full" />
            ) : statusChartData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No ticket status data available.
              </div>
            ) : (
              <ChartContainer config={statusChartConfig} className="h-full w-full">
                <PieChart>
                  <Pie
                    data={statusChartData}
                    dataKey="count"
                    nameKey="label"
                    cx="50%"
                    cy="55%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={6}
                  >
                    {statusChartData.map((entry) => (
                      <Cell key={entry.key} fill={entry.color} strokeWidth={2} />
                    ))}
                  </Pie>
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value, name) => [`${Number(value)} tickets`, name as string]}
                      />
                    }
                  />
                  <ChartLegend
                    verticalAlign="bottom"
                    content={<ChartLegendContent nameKey="label" />}
                  />
                </PieChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader>
            <CardTitle>Attendance Over Time</CardTitle>
            <CardDescription>
              Based on ticket check-ins recorded for this session
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-6">
            {isLoading ? (
              <Skeleton className="h-[260px] w-full" />
            ) : attendanceChartData.length === 0 ? (
              <div className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">
                No check-ins have been recorded yet.
              </div>
            ) : (
              <ChartContainer config={attendanceChartConfig} className="h-[260px] w-full">
                <LineChart
                  accessibilityLayer
                  data={attendanceChartData}
                  margin={{ left: 0, right: 12, top: 8, bottom: 8 }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => {
                      try {
                        return format(parse(value, 'yyyyMMdd', new Date()), 'MMM dd')
                      } catch {
                        return value
                      }
                    }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    allowDecimals={false}
                    width={40}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        hideLabel
                        formatter={(value) => [`${Number(value)} check-ins`, 'Attendance']}
                      />
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="attendance"
                    stroke="var(--color-chart-1)"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-40 w-full rounded-xl" />
          ))}
        </div>
      ) : tickets.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex h-40 flex-col items-center justify-center text-center text-muted-foreground">
            <p className="text-sm font-medium">No tickets issued for this session yet.</p>
            <p className="text-xs">Tickets will appear here as soon as orders are completed.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {tickets.map((ticket) => (
            <SessionTicketCard key={ticket.ticket_id} ticket={ticket} />
          ))}
        </div>
      )}
    </div>
  )
}
