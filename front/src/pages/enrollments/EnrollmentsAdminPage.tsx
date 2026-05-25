import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Users, ChevronDown, ChevronRight, Building2, CalendarDays } from 'lucide-react'
import { activityService, type Activity, activityStatusLabels } from '@/services/activity.service'
import { adminEnrollmentService } from '@/services/admin-enrollment.service'
import type { AdminEnrollment } from '@/services/enrollment.service'
import { SearchEngine } from '@/components/common/SearchEngine'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

const statusVariant: Record<string, string> = {
    SCHEDULED: 'bg-blue-100 text-blue-800',
    IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
    COMPLETED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
}

function EnrollmentList({ activityId }: { activityId: number }) {
    const { data: enrollments = [], isLoading } = useQuery({
        queryKey: ['admin-enrollments', activityId],
        queryFn: () => adminEnrollmentService.findByActivity(activityId),
    })

    if (isLoading) {
        return (
            <div className="px-4 pb-4 space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-8 w-full" />
                ))}
            </div>
        )
    }

    if (enrollments.length === 0) {
        return (
            <p className="px-4 pb-4 text-sm text-muted-foreground">
                No hay estudiantes inscritos en esta clase.
            </p>
        )
    }

    return (
        <div className="px-4 pb-4">
            <div className="rounded-lg border overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                        <tr>
                            <th className="text-left px-3 py-2 font-medium text-muted-foreground text-xs">Nombre</th>
                            <th className="text-left px-3 py-2 font-medium text-muted-foreground text-xs">DNI</th>
                            <th className="text-left px-3 py-2 font-medium text-muted-foreground text-xs">Institución</th>
                            <th className="text-left px-3 py-2 font-medium text-muted-foreground text-xs">Grado</th>
                            <th className="text-left px-3 py-2 font-medium text-muted-foreground text-xs">Teléfono</th>
                            <th className="text-left px-3 py-2 font-medium text-muted-foreground text-xs">Inscrito</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(enrollments as AdminEnrollment[]).map((e, idx) => (
                            <tr key={e.id} className={cn('border-t', idx % 2 === 0 ? 'bg-white' : 'bg-muted/20')}>
                                <td className="px-3 py-2 font-medium">
                                    {e.student.firstName} {e.student.lastName}
                                </td>
                                <td className="px-3 py-2 text-muted-foreground">{e.student.dni}</td>
                                <td className="px-3 py-2 text-muted-foreground max-w-[160px] truncate">
                                    {e.student.institutionName}
                                </td>
                                <td className="px-3 py-2 text-muted-foreground">{e.student.grade ?? '—'}</td>
                                <td className="px-3 py-2 text-muted-foreground">{e.student.phone ?? '—'}</td>
                                <td className="px-3 py-2 text-muted-foreground text-xs whitespace-nowrap">
                                    {format(new Date(e.enrolledAt), "d MMM yyyy", { locale: es })}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <p className="text-xs text-muted-foreground mt-2">{enrollments.length} estudiante(s) inscritos.</p>
        </div>
    )
}

function ActivityEnrollmentRow({ activity }: { activity: Activity }) {
    const [expanded, setExpanded] = useState(false)

    return (
        <div className="border rounded-lg overflow-hidden">
            <button
                className="w-full flex items-center gap-3 px-4 py-3 bg-white hover:bg-muted/30 transition-colors text-left"
                onClick={() => setExpanded((v) => !v)}
            >
                <div className="flex-1 grid sm:grid-cols-3 gap-2 items-center">
                    <div>
                        <p className="text-sm font-medium">{activity.title}</p>
                        {activity.institution && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                <Building2 className="h-3 w-3" />
                                {activity.institution.name}
                            </p>
                        )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <CalendarDays className="h-3.5 w-3.5 flex-shrink-0" />
                        {format(new Date(activity.date + 'T00:00:00'), "d MMM yyyy", { locale: es })}
                        {activity.startTime && ` · ${activity.startTime}`}
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', statusVariant[activity.status])}>
                            {activityStatusLabels[activity.status]}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground flex-shrink-0">
                    <span className="flex items-center gap-1 text-xs">
                        <Users className="h-3.5 w-3.5" />
                        Inscritos
                    </span>
                    {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </div>
            </button>

            {expanded && <EnrollmentList activityId={activity.id} />}
        </div>
    )
}

export default function EnrollmentsAdminPage() {
    const [search, setSearch] = useState('')

    const { data: activities = [], isLoading } = useQuery({
        queryKey: ['activities-for-enrollments', search],
        queryFn: () => activityService.findAll(search || undefined),
    })

    const filtered = activities.filter((a) => a.status !== 'CANCELLED')

    return (
        <section className="space-y-4 p-4 lg:p-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-semibold">Inscripciones por clase</h2>
                </div>
                <SearchEngine
                    value={search}
                    onSearch={setSearch}
                    placeholder="Buscar clase..."
                />
            </div>

            <p className="text-sm text-muted-foreground">
                Expande una clase para ver los estudiantes inscritos.
            </p>

            {isLoading ? (
                <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full rounded-lg" />
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center text-muted-foreground text-sm py-16 border rounded-xl">
                    No hay clases disponibles.
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map((activity) => (
                        <ActivityEnrollmentRow key={activity.id} activity={activity} />
                    ))}
                </div>
            )}
        </section>
    )
}
