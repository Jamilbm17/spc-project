import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
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
} from 'date-fns'
import { es } from 'date-fns/locale'
import {
    ChevronLeft,
    ChevronRight,
    CalendarDays,
    Clock,
    MapPin,
    Building2,
    BookOpen,
    Users,
    X,
} from 'lucide-react'
import { studentApi } from '@/lib/api'
import { type Activity, activityStatusLabels } from '@/services/activity.service'
import { enrollmentService } from '@/services/enrollment.service'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { getHttpErrorMessage } from '@/lib/error'

const statusColors: Record<string, string> = {
    SCHEDULED: 'bg-blue-100 text-blue-800 border-blue-200',
    IN_PROGRESS: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    COMPLETED: 'bg-green-100 text-green-800 border-green-200',
    CANCELLED: 'bg-red-100 text-red-800 border-red-200',
}

const statusDot: Record<string, string> = {
    SCHEDULED: 'bg-blue-500',
    IN_PROGRESS: 'bg-yellow-500',
    COMPLETED: 'bg-green-500',
    CANCELLED: 'bg-red-500',
}

export default function StudentCalendarPage() {
    const queryClient = useQueryClient()
    const [currentDate, setCurrentDate] = useState(new Date())
    const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)

    const year = currentDate.getFullYear()
    const month = currentDate.getMonth() + 1

    const { data: activities = [], isLoading } = useQuery({
        queryKey: ['student-calendar', year, month],
        queryFn: () =>
            studentApi.get('/activities/calendar', { params: { year, month } }) as Promise<Activity[]>,
    })

    // Check enrollment for selected activity
    const { data: enrollCheck, isLoading: loadingCheck } = useQuery({
        queryKey: ['enroll-check', selectedActivity?.id],
        queryFn: () => enrollmentService.check(selectedActivity!.id),
        enabled: !!selectedActivity,
    })

    const enrollMutation = useMutation({
        mutationFn: (activityId: number) => enrollmentService.enroll(activityId),
        onSuccess: () => {
            toast.success('¡Te has inscrito en la clase!')
            queryClient.invalidateQueries({ queryKey: ['enroll-check', selectedActivity?.id] })
            queryClient.invalidateQueries({ queryKey: ['student-my-enrollments-dashboard'] })
        },
        onError: (err) => toast.error('Error al inscribirse', { description: getHttpErrorMessage(err) }),
    })

    const cancelMutation = useMutation({
        mutationFn: (enrollmentId: number) => enrollmentService.cancel(enrollmentId),
        onSuccess: () => {
            toast.success('Inscripción cancelada.')
            queryClient.invalidateQueries({ queryKey: ['enroll-check', selectedActivity?.id] })
            queryClient.invalidateQueries({ queryKey: ['student-my-enrollments-dashboard'] })
        },
        onError: (err) => toast.error('Error al cancelar', { description: getHttpErrorMessage(err) }),
    })

    // Build calendar grid
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(monthStart)
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })

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

    const getActivitiesForDay = (date: Date) => {
        const dateStr = format(date, 'yyyy-MM-dd')
        return activities.filter((a) => a.date === dateStr && a.status !== 'CANCELLED')
    }

    const dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

    const isMutating = enrollMutation.isPending || cancelMutation.isPending

    return (
        <section className="p-4 lg:p-6 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <CalendarDays className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-semibold capitalize">
                        {format(currentDate, 'MMMM yyyy', { locale: es })}
                    </h2>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="h-8" onClick={() => setCurrentDate(new Date())}>
                        Hoy
                    </Button>
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="flex gap-4 flex-col lg:flex-row">
                {/* Calendar */}
                <div className="flex-1 border rounded-xl overflow-hidden bg-white">
                    {/* Day names */}
                    <div className="grid grid-cols-7 border-b">
                        {dayNames.map((name) => (
                            <div key={name} className="py-2 text-center text-xs font-semibold text-muted-foreground">
                                {name}
                            </div>
                        ))}
                    </div>

                    {/* Weeks */}
                    <div>
                        {isLoading
                            ? Array.from({ length: 5 }).map((_, wi) => (
                                <div key={wi} className="grid grid-cols-7">
                                    {Array.from({ length: 7 }).map((_, di) => (
                                        <div key={di} className="min-h-[80px] border-b border-r p-1 last:border-r-0" />
                                    ))}
                                </div>
                            ))
                            : weeks.map((week, wi) => (
                                <div key={wi} className="grid grid-cols-7">
                                    {week.map((date, di) => {
                                        const dayActivities = getActivitiesForDay(date)
                                        const isToday = isSameDay(date, new Date())
                                        const isCurrentMonth = isSameMonth(date, currentDate)

                                        return (
                                            <div
                                                key={di}
                                                className={cn(
                                                    'min-h-[80px] border-b border-r p-1 last:border-r-0',
                                                    !isCurrentMonth && 'bg-muted/30',
                                                )}
                                            >
                                                <p
                                                    className={cn(
                                                        'text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full mb-1',
                                                        isToday && 'bg-primary text-white',
                                                        !isCurrentMonth && 'text-muted-foreground',
                                                    )}
                                                >
                                                    {format(date, 'd')}
                                                </p>
                                                <div className="space-y-0.5">
                                                    {dayActivities.slice(0, 2).map((activity) => (
                                                        <button
                                                            key={activity.id}
                                                            onClick={() => setSelectedActivity(activity)}
                                                            className={cn(
                                                                'w-full text-left text-[10px] leading-tight px-1 py-0.5 rounded truncate flex items-center gap-1 hover:opacity-80 transition-opacity border',
                                                                statusColors[activity.status],
                                                            )}
                                                        >
                                                            <span
                                                                className={cn(
                                                                    'w-1.5 h-1.5 rounded-full flex-shrink-0',
                                                                    statusDot[activity.status],
                                                                )}
                                                            />
                                                            {activity.title}
                                                        </button>
                                                    ))}
                                                    {dayActivities.length > 2 && (
                                                        <p className="text-[10px] text-muted-foreground px-1">
                                                            +{dayActivities.length - 2} más
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            ))}
                    </div>
                </div>

                {/* Activity detail panel */}
                {selectedActivity ? (
                    <div className="lg:w-80 border rounded-xl p-4 bg-white space-y-4 self-start">
                        <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold text-sm leading-tight">{selectedActivity.title}</h3>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 flex-shrink-0"
                                onClick={() => setSelectedActivity(null)}
                            >
                                <X className="h-3.5 w-3.5" />
                            </Button>
                        </div>

                        <span className={cn('text-xs px-2.5 py-1 rounded-full font-medium inline-block border', statusColors[selectedActivity.status])}>
                            {activityStatusLabels[selectedActivity.status]}
                        </span>

                        <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <CalendarDays className="h-4 w-4 flex-shrink-0" />
                                <span>{format(new Date(selectedActivity.date + 'T00:00:00'), "EEEE d 'de' MMMM yyyy", { locale: es })}</span>
                            </div>
                            {(selectedActivity.startTime || selectedActivity.endTime) && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Clock className="h-4 w-4 flex-shrink-0" />
                                    <span>
                                        {selectedActivity.startTime}
                                        {selectedActivity.endTime && ` – ${selectedActivity.endTime}`}
                                    </span>
                                </div>
                            )}
                            {selectedActivity.location && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <MapPin className="h-4 w-4 flex-shrink-0" />
                                    <span>{selectedActivity.location}</span>
                                </div>
                            )}
                            {selectedActivity.institution && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Building2 className="h-4 w-4 flex-shrink-0" />
                                    <span>{selectedActivity.institution.name}</span>
                                </div>
                            )}
                            {selectedActivity.topic && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <BookOpen className="h-4 w-4 flex-shrink-0" />
                                    <span>{selectedActivity.topic.name}</span>
                                </div>
                            )}
                            {selectedActivity.expectedParticipants && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Users className="h-4 w-4 flex-shrink-0" />
                                    <span>Capacidad: {selectedActivity.expectedParticipants}</span>
                                </div>
                            )}
                        </div>

                        {selectedActivity.description && (
                            <p className="text-xs text-muted-foreground border-t pt-3">{selectedActivity.description}</p>
                        )}

                        {/* Enrollment actions */}
                        {selectedActivity.status === 'SCHEDULED' || selectedActivity.status === 'IN_PROGRESS' ? (
                            <div className="border-t pt-3">
                                {loadingCheck ? (
                                    <div className="flex justify-center py-2">
                                        <Spinner className="h-4 w-4" />
                                    </div>
                                ) : enrollCheck?.enrolled ? (
                                    <div className="space-y-2">
                                        <p className="text-xs text-primary font-medium flex items-center gap-1">
                                            ✓ Ya estás inscrito en esta clase
                                        </p>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full text-destructive border-destructive/50 hover:bg-destructive/10"
                                            disabled={isMutating}
                                            onClick={() => cancelMutation.mutate(enrollCheck.enrollmentId!)}
                                        >
                                            {cancelMutation.isPending && <Spinner className="h-3 w-3" />}
                                            Cancelar inscripción
                                        </Button>
                                    </div>
                                ) : (
                                    <Button
                                        size="sm"
                                        className="w-full"
                                        disabled={isMutating}
                                        onClick={() => enrollMutation.mutate(selectedActivity.id)}
                                    >
                                        {enrollMutation.isPending && <Spinner className="h-3 w-3" />}
                                        Inscribirme en esta clase
                                    </Button>
                                )}
                            </div>
                        ) : null}
                    </div>
                ) : (
                    <div className="lg:w-80 border rounded-xl p-6 bg-white flex flex-col items-center justify-center text-center text-muted-foreground gap-3 self-start min-h-[200px]">
                        <CalendarDays className="h-8 w-8 opacity-30" />
                        <p className="text-sm">Selecciona una clase en el calendario para ver los detalles e inscribirte.</p>
                    </div>
                )}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                {Object.entries(activityStatusLabels).map(([key, label]) => (
                    <div key={key} className="flex items-center gap-1.5">
                        <span className={cn('w-2.5 h-2.5 rounded-full', statusDot[key])} />
                        {label}
                    </div>
                ))}
            </div>
        </section>
    )
}
