"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Monitor, MapPin } from "lucide-react"
import {SessionFormData} from "@/lib/validators/event";

interface SessionSelectorProps {
    sessions: SessionFormData[]
    selectedSessions: string[]
    onSelectionChange: (selectedSessions: string[]) => void
}

export function SessionSelector({ sessions, selectedSessions, onSelectionChange }: SessionSelectorProps) {
    const handleSessionToggle = (sessionId: string) => {
        const newSelection = selectedSessions.includes(sessionId)
            ? selectedSessions.filter((id) => id !== sessionId)
            : [...selectedSessions, sessionId]
        onSelectionChange(newSelection)
    }

    const selectAll = () => {
        onSelectionChange(sessions.map((session) => session.id))
    }

    const selectNone = () => {
        onSelectionChange([])
    }

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString)
        return {
            date: date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
            }),
            time: date.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
            }),
        }
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Applicable Sessions
                    </CardTitle>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={selectAll}>
                            Select All
                        </Button>
                        <Button variant="outline" size="sm" onClick={selectNone}>
                            Select None
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {sessions.map((session, index) => {
                        const startDateTime = formatDateTime(session.startTime)
                        const endDateTime = formatDateTime(session.endTime)

                        return (
                            <div
                                key={session.id}
                                className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                            >
                                <Checkbox
                                    id={`session-${session.id}`}
                                    checked={selectedSessions.includes(session.id)}
                                    onCheckedChange={() => handleSessionToggle(session.id)}
                                />
                                <div className="flex items-center gap-4 flex-1">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                                        {index + 1}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <span className="font-medium">{startDateTime.date}</span>
                                            <Badge variant={session.sessionType === "PHYSICAL" ? "default" : "secondary"}>
                                                {session.sessionType === "PHYSICAL" ? (
                                                    <>
                                                        <MapPin className="h-3 w-3 mr-1" />
                                                        Physical
                                                    </>
                                                ) : (
                                                    <>
                                                        <Monitor className="h-3 w-3 mr-1" />
                                                        Online
                                                    </>
                                                )}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Clock className="h-4 w-4" />
                                            <span>
                        {startDateTime.time} - {endDateTime.time}
                      </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
                <div className="mt-4 text-sm text-muted-foreground">
                    {selectedSessions.length} of {sessions.length} sessions selected
                </div>
            </CardContent>
        </Card>
    )
}
