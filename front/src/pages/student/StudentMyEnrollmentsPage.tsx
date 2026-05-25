import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
    BookOpen,
    CalendarDays,
    Clock,
    MapPin,
    Building2,
    Trash2,
    Search,
} from 'lucide-react'
import { enrollmentService, type Enrollment } from '@/services/enrollment.service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { WarningDialog } from '@/components/common/WarningDialog'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'
import { getHttpErrorMessage } from '@/lib/error'
import { cn } from '@/lib/utils'
import { type ActivityStatus, activityStatusLabels } from '@/services/activity.service'

const statusColors: Record<string, string> = {
    SCHEDULED: 'bg-blue-100 text-blue-800',
    IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
    COMPLETED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
}

export default function StudentMyEnrollmentsPage() {
    const queryClient = useQueryClient()
    const [search, setSearch] = useState('')

    const { data: enrollments = [], isLoading } = useQuery({
        queryKey: ['student-my-enrollments'],
        queryFn: () => enrollmentService.findMy(),
    })

    const cancelMutation = useMutation({
        mutationFn: (enrollmentId: number) => enrollmentService.cancel(enrollmentId),
        onSuccess: () => {
            toast.success('Inscripción cancelada.')
            queryClient.invalidateQueries({ queryKey: ['student-my-enrollments'] })
            queryClient.invalidateQueries({ queryKey: ['student-my-enrollments-dashboard'] })
        },
        onError: (err) => toast.error('Error al cancelar', { description: getHttpErrorMessage(err) }),
    })

    const filtered = enrollments.filter((e: Enrollment) =>
        !search || e.activity?.title?.toLowerCase().includes(search.toLowerCase()),
    )

    return (
        <section className="p-4 lg:p-6 space-y-4">
            {/* Header */}
            <div className="flex items-center gap-3">
                <BookOpen className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">Mis inscripciones</h2>
            </div>

            {/* Search */}
            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    className="pl-9"
                    placeholder="Buscar clase..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {isLoading ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="h-40 rounded-xl" />
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center text-muted-foreground text-sm py-16 border rounded-xl">
                    {search ? 'No se encontraron resultados.' : 'Aún no te has inscrito a ninguna clase.'}
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map((enrollment: Enrollment) => {
                        const activity = enrollment.activity
                        const canCancel =
                            activity?.status === 'SCHEDULED' || activity?.status === 'IN_PROGRESS'
                        return (
                            <div
                                key={enrollment.id}
                                className="border rounded-xl p-4 bg-white space-y-3 hover:shadow-sm transition-shadow"
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <p className="text-sm font-semibold leading-tight">{activity?.title ?? '—'}</p>
                                    {activity?.status && (
                                        <span
                                            className={cn(
                                                'text-[10px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap',
                                                statusColors[activity.status],
                                            )}
                                        >
                                            {activityStatusLabels[activity.status as ActivityStatus]}
                                        </span>
                                    )}
                                </div>

                                <div className="space-y-1.5 text-xs text-muted-foreground">
                                    {activity?.date && (
                                        <div className="flex items-center gap-1.5">
                                            <CalendarDays className="h-3.5 w-3.5 flex-shrink-0" />
                                            {format(new Date(activity.date + 'T00:00:00'), "EEEE d 'de' MMMM yyyy", { locale: es })}
                                        </div>
                                    )}
                                    {activity?.startTime && (
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="h-3.5 w-3.5 flex-shrink-0" />
                                            {activity.startTime}
                                            {activity.endTime && ` – ${activity.endTime}`}
                                        </div>
                                    )}
                                    {activity?.location && (
                                        <div className="flex items-center gap-1.5">
                                            <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                                            {activity.location}
                                        </div>
                                    )}
                                    {activity?.institution && (
                                        <div className="flex items-center gap-1.5">
                                            <Building2 className="h-3.5 w-3.5 flex-shrink-0" />
                                            {activity.institution.name}
                                        </div>
                                    )}
                                </div>

                                <p className="text-[10px] text-muted-foreground">
                                    Inscrito el{' '}
                                    {format(new Date(enrollment.enrolledAt), "d 'de' MMMM yyyy", { locale: es })}
                                </p>

                                {canCancel && (
                                    <WarningDialog
                                        description="Se cancelará tu inscripción en esta clase."
                                        onSubmit={() => cancelMutation.mutate(enrollment.id)}
                                    >
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full text-destructive border-destructive/50 hover:bg-destructive/10"
                                            disabled={cancelMutation.isPending}
                                        >
                                            {cancelMutation.isPending && <Spinner className="h-3 w-3" />}
                                            <Trash2 className="h-3.5 w-3.5 mr-1" />
                                            Cancelar inscripción
                                        </Button>
                                    </WarningDialog>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}
        </section>
    )
}
