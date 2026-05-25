import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    addDays,
    addMonths,
    subMonths,
    isSameMonth,
    isSameDay,
    parseISO,
} from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { activityService, type Activity, activityStatusLabels } from '@/services/activity.service'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog'

const statusColors: Record<string, string> = {
    SCHEDULED: 'bg-blue-100 text-blue-800 border-blue-200',
    IN_PROGRESS: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    COMPLETED: 'bg-green-100 text-green-800 border-green-200',
    CANCELLED: 'bg-red-100 text-red-800 border-red-200',
}

export default function CalendarPage() {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)

    const year = currentDate.getFullYear()
    const month = currentDate.getMonth() + 1

    const { data: activities = [], isLoading } = useQuery({
        queryKey: ['activities', 'calendar', year, month],
        queryFn: () => activityService.findCalendar(year, month),
    })

    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(monthStart)
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })

    // Build rows of weeks
    const weeks: Date[][] = []
    let day = calendarStart
    while (day <= calendarEnd) {
        const week: Date[] = []
        for (let i = 0; i < 7; i++) {
            week.push(day)
            day = addDays(day, 1)
        }
        weeks.push(week)
    }

    const getActivitiesForDay = (date: Date): Activity[] => {
        const dateStr = format(date, 'yyyy-MM-dd')
        return activities.filter((a) => a.date === dateStr)
    }

    const dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

    return (
        <section className="space-y-4 p-4 lg:p-6">
            {/* Navigation */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-semibold capitalize">
                        {format(currentDate, 'MMMM yyyy', { locale: es })}
                    </h2>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
                        Hoy
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Legend */}
            <div className="flex gap-3 flex-wrap">
                {Object.entries(activityStatusLabels).map(([key, label]) => (
                    <div key={key} className="flex items-center gap-1.5">
                        <div className={cn('w-3 h-3 rounded-sm border', statusColors[key])} />
                        <span className="text-xs text-muted-foreground">{label}</span>
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="rounded-lg border bg-card overflow-hidden">
                {/* Day headers */}
                <div className="grid grid-cols-7 border-b">
                    {dayNames.map((name) => (
                        <div
                            key={name}
                            className="py-2 text-center text-xs font-semibold text-muted-foreground border-r last:border-r-0"
                        >
                            {name}
                        </div>
                    ))}
                </div>

                {/* Weeks */}
                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <p className="text-muted-foreground text-sm">Cargando actividades...</p>
                    </div>
                ) : (
                    weeks.map((week, wi) => (
                        <div key={wi} className="grid grid-cols-7 border-b last:border-b-0">
                            {week.map((dayDate, di) => {
                                const dayActivities = getActivitiesForDay(dayDate)
                                const isCurrentMonth = isSameMonth(dayDate, currentDate)
                                const isToday = isSameDay(dayDate, new Date())

                                return (
                                    <div
                                        key={di}
                                        className={cn(
                                            'min-h-[100px] p-1.5 border-r last:border-r-0 transition-colors',
                                            !isCurrentMonth && 'bg-muted/30',
                                            isToday && 'bg-primary/5'
                                        )}
                                    >
                                        {/* Day number */}
                                        <div
                                            className={cn(
                                                'w-7 h-7 flex items-center justify-center rounded-full text-sm font-medium mb-1',
                                                isToday
                                                    ? 'bg-primary text-primary-foreground'
                                                    : !isCurrentMonth
                                                        ? 'text-muted-foreground'
                                                        : 'text-foreground'
                                            )}
                                        >
                                            {format(dayDate, 'd')}
                                        </div>

                                        {/* Activities */}
                                        <div className="space-y-0.5">
                                            {dayActivities.slice(0, 3).map((activity) => (
                                                <button
                                                    key={activity.id}
                                                    onClick={() => setSelectedActivity(activity)}
                                                    className={cn(
                                                        'w-full text-left px-1.5 py-0.5 rounded text-xs font-medium truncate border transition-opacity hover:opacity-80',
                                                        statusColors[activity.status]
                                                    )}
                                                    title={activity.title}
                                                >
                                                    {activity.startTime && (
                                                        <span className="opacity-70 mr-1">{activity.startTime.slice(0, 5)}</span>
                                                    )}
                                                    {activity.title}
                                                </button>
                                            ))}
                                            {dayActivities.length > 3 && (
                                                <p className="text-xs text-muted-foreground px-1">
                                                    +{dayActivities.length - 3} más
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    ))
                )}
            </div>

            {/* Activity detail modal */}
            <Dialog open={!!selectedActivity} onOpenChange={() => setSelectedActivity(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-primary">{selectedActivity?.title}</DialogTitle>
                        <DialogDescription>
                            Detalles de la actividad
                        </DialogDescription>
                    </DialogHeader>
                    {selectedActivity && (
                        <div className="space-y-3 text-sm">
                            <div className="flex items-center gap-2">
                                <span className="font-medium w-28">Estado:</span>
                                <Badge variant="outline" className={statusColors[selectedActivity.status]}>
                                    {activityStatusLabels[selectedActivity.status]}
                                </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-medium w-28">Fecha:</span>
                                <span>{selectedActivity.date}</span>
                            </div>
                            {(selectedActivity.startTime || selectedActivity.endTime) && (
                                <div className="flex items-center gap-2">
                                    <span className="font-medium w-28">Horario:</span>
                                    <span>
                                        {selectedActivity.startTime && selectedActivity.startTime.slice(0, 5)}
                                        {selectedActivity.endTime && ` — ${selectedActivity.endTime.slice(0, 5)}`}
                                    </span>
                                </div>
                            )}
                            {selectedActivity.location && (
                                <div className="flex items-center gap-2">
                                    <span className="font-medium w-28">Lugar:</span>
                                    <span>{selectedActivity.location}</span>
                                </div>
                            )}
                            {selectedActivity.institution && (
                                <div className="flex items-center gap-2">
                                    <span className="font-medium w-28">Institución:</span>
                                    <span>{selectedActivity.institution.name}</span>
                                </div>
                            )}
                            {selectedActivity.topic && (
                                <div className="flex items-center gap-2">
                                    <span className="font-medium w-28">Tema:</span>
                                    <span>{selectedActivity.topic.name}</span>
                                </div>
                            )}
                            {selectedActivity.expectedParticipants && (
                                <div className="flex items-center gap-2">
                                    <span className="font-medium w-28">Participantes:</span>
                                    <span>{selectedActivity.expectedParticipants} esperados</span>
                                </div>
                            )}
                            {selectedActivity.description && (
                                <div className="flex gap-2">
                                    <span className="font-medium w-28 shrink-0">Descripción:</span>
                                    <span className="text-muted-foreground">{selectedActivity.description}</span>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </section>
    )
}
