import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
    CalendarDays,
    BookOpen,
    Clock,
    MapPin,
    Building2,
    ChevronRight,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { studentApi } from '@/lib/api'
import { type Activity, activityStatusLabels } from '@/services/activity.service'
import { enrollmentService, type Enrollment } from '@/services/enrollment.service'
import { useStudentAuth } from '@/providers/StudentAuthProvider'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { PATHS } from '@/router/paths'

const statusColors: Record<string, string> = {
    SCHEDULED: 'bg-blue-100 text-blue-800',
    IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
    COMPLETED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
}

export default function StudentDashboardPage() {
    const { student } = useStudentAuth()

    const { data: upcomingActivities = [], isLoading: loadingActivities } = useQuery({
        queryKey: ['student-activities-upcoming'],
        queryFn: () =>
            studentApi.get('/activities', {
                params: { query: '' },
            }) as Promise<Activity[]>,
    })

    const { data: myEnrollments = [], isLoading: loadingEnrollments } = useQuery({
        queryKey: ['student-my-enrollments-dashboard'],
        queryFn: () => enrollmentService.findMy(),
    })

    const today = new Date()
    const upcoming = upcomingActivities
        .filter((a) => a.status === 'SCHEDULED' && new Date(a.date) >= today)
        .slice(0, 5)

    const enrolledIds = new Set(myEnrollments.map((e: Enrollment) => e.activityId))

    return (
        <section className="p-4 lg:p-6 space-y-6">
            {/* Welcome banner */}
            <div className="rounded-xl bg-gradient-to-r from-primary to-primary/80 p-6 text-white">
                <p className="text-sm opacity-80 mb-1">
                    {format(today, "EEEE, d 'de' MMMM yyyy", { locale: es })}
                </p>
                <h1 className="text-2xl font-bold">¡Hola, {student?.name?.split(' ')[0]}! 👋</h1>
                <p className="text-sm opacity-80 mt-1">Bienvenido al portal estudiantil del SPC.</p>
                <div className="flex gap-4 mt-4">
                    <div className="bg-white/20 rounded-lg px-4 py-2 text-center">
                        <p className="text-2xl font-bold">{myEnrollments.length}</p>
                        <p className="text-xs opacity-80">Inscripciones</p>
                    </div>
                    <div className="bg-white/20 rounded-lg px-4 py-2 text-center">
                        <p className="text-2xl font-bold">{upcoming.length}</p>
                        <p className="text-xs opacity-80">Clases próximas</p>
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Upcoming classes */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h2 className="text-base font-semibold flex items-center gap-2">
                            <CalendarDays className="h-4 w-4 text-primary" />
                            Clases próximas
                        </h2>
                        <Button variant="ghost" size="sm" asChild>
                            <Link to={PATHS.STUDENT.CALENDAR} className="flex items-center gap-1 text-xs text-primary">
                                Ver todas <ChevronRight className="h-3 w-3" />
                            </Link>
                        </Button>
                    </div>

                    {loadingActivities ? (
                        Array.from({ length: 3 }).map((_, i) => (
                            <Skeleton key={i} className="h-20 w-full rounded-lg" />
                        ))
                    ) : upcoming.length === 0 ? (
                        <div className="text-center text-muted-foreground text-sm py-8 border rounded-lg">
                            No hay clases próximas programadas.
                        </div>
                    ) : (
                        upcoming.map((activity) => (
                            <div
                                key={activity.id}
                                className={cn(
                                    'border rounded-lg p-3 space-y-1.5 transition-colors hover:bg-muted/50',
                                    enrolledIds.has(activity.id) && 'border-primary/40 bg-primary/5',
                                )}
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <p className="text-sm font-medium leading-tight">{activity.title}</p>
                                    <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap', statusColors[activity.status])}>
                                        {activityStatusLabels[activity.status]}
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <CalendarDays className="h-3 w-3" />
                                        {format(new Date(activity.date + 'T00:00:00'), "d MMM", { locale: es })}
                                    </span>
                                    {activity.startTime && (
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {activity.startTime}
                                        </span>
                                    )}
                                    {activity.location && (
                                        <span className="flex items-center gap-1">
                                            <MapPin className="h-3 w-3" />
                                            {activity.location}
                                        </span>
                                    )}
                                </div>
                                {enrolledIds.has(activity.id) && (
                                    <span className="inline-flex items-center gap-1 text-xs text-primary font-medium">
                                        ✓ Inscrito
                                    </span>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {/* My enrollments */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h2 className="text-base font-semibold flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-primary" />
                            Mis inscripciones
                        </h2>
                        <Button variant="ghost" size="sm" asChild>
                            <Link to={PATHS.STUDENT.MY_ENROLLMENTS} className="flex items-center gap-1 text-xs text-primary">
                                Ver todas <ChevronRight className="h-3 w-3" />
                            </Link>
                        </Button>
                    </div>

                    {loadingEnrollments ? (
                        Array.from({ length: 3 }).map((_, i) => (
                            <Skeleton key={i} className="h-20 w-full rounded-lg" />
                        ))
                    ) : myEnrollments.length === 0 ? (
                        <div className="text-center text-muted-foreground text-sm py-8 border rounded-lg">
                            Aún no te has inscrito a ninguna clase.{' '}
                            <Link to={PATHS.STUDENT.CALENDAR} className="text-primary hover:underline">
                                Ver clases disponibles
                            </Link>
                        </div>
                    ) : (
                        myEnrollments.slice(0, 5).map((enrollment: Enrollment) => (
                            <div key={enrollment.id} className="border rounded-lg p-3 space-y-1.5">
                                <p className="text-sm font-medium">{enrollment.activity?.title ?? '—'}</p>
                                <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                                    {enrollment.activity?.date && (
                                        <span className="flex items-center gap-1">
                                            <CalendarDays className="h-3 w-3" />
                                            {format(new Date(enrollment.activity.date + 'T00:00:00'), "d MMM yyyy", { locale: es })}
                                        </span>
                                    )}
                                    {enrollment.activity?.institution && (
                                        <span className="flex items-center gap-1">
                                            <Building2 className="h-3 w-3" />
                                            {enrollment.activity.institution.name}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </section>
    )
}
