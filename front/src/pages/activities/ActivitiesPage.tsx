import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Pencil, Trash2, Building2, X, ClipboardList } from 'lucide-react'
import { toast } from 'sonner'
import {
    activityService,
    type Activity,
    type CreateActivityDto,
    activityStatusLabels,
} from '@/services/activity.service'
import { institutionService } from '@/services/institution.service'
import { topicService } from '@/services/topic.service'
import { getHttpErrorMessage } from '@/lib/error'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { SearchEngine } from '@/components/common/SearchEngine'
import { SearchableSelect } from '@/components/common/SearchableSelect'
import { WarningDialog } from '@/components/common/WarningDialog'
import { FormDialog } from '@/components/common/FormDialog'

const schema = z.object({
    title: z.string().min(1, 'Requerido').max(200),
    description: z.string().optional(),
    date: z.string().min(1, 'Requerido'),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    location: z.string().optional(),
    status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
    expectedParticipants: z.coerce.number().optional(),
    institutionId: z.coerce.number().optional(),
    topicId: z.coerce.number().optional(),
})

type FormValues = z.infer<typeof schema>

const statusVariant: Record<string, 'default' | 'success' | 'warning' | 'destructive' | 'muted'> = {
    SCHEDULED: 'info' as any,
    IN_PROGRESS: 'warning',
    COMPLETED: 'success',
    CANCELLED: 'destructive',
}

export default function ActivitiesPage() {
    const queryClient = useQueryClient()
    const navigate = useNavigate()
    const [search, setSearch] = useState('')
    const [filterInstitutionId, setFilterInstitutionId] = useState<number | undefined>()
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editing, setEditing] = useState<Activity | null>(null)

    const { data: activities = [], isLoading } = useQuery({
        queryKey: ['activities', search],
        queryFn: () => activityService.findAll(search || undefined),
    })

    const { data: institutions = [] } = useQuery({
        queryKey: ['institutions'],
        queryFn: () => institutionService.findAll(),
    })

    const { data: topics = [] } = useQuery({
        queryKey: ['topics'],
        queryFn: () => topicService.findAll(),
    })

    // Client-side institution filter
    const filtered = useMemo(() => {
        if (!filterInstitutionId) return activities
        return activities.filter((a) => a.institutionId === filterInstitutionId)
    }, [activities, filterInstitutionId])

    const institutionOptions = useMemo(
        () => institutions.map((i) => ({ value: i.id, label: i.name })),
        [institutions],
    )
    const topicOptions = useMemo(
        () => topics.map((t) => ({ value: t.id, label: t.name })),
        [topics],
    )

    const { mutate: createActivity, isPending: isCreating } = useMutation({
        mutationFn: activityService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['activities'] })
            toast.success('Actividad creada correctamente')
            setDialogOpen(false)
        },
        onError: (err) => toast.error('Error al crear', { description: getHttpErrorMessage(err) }),
    })

    const { mutate: updateActivity, isPending: isUpdating } = useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<CreateActivityDto> }) =>
            activityService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['activities'] })
            toast.success('Actividad actualizada correctamente')
            setDialogOpen(false)
            setEditing(null)
        },
        onError: (err) => toast.error('Error al actualizar', { description: getHttpErrorMessage(err) }),
    })

    const { mutate: deleteActivity } = useMutation({
        mutationFn: activityService.remove,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['activities'] })
            toast.success('Actividad eliminada')
        },
        onError: (err) => toast.error('Error al eliminar', { description: getHttpErrorMessage(err) }),
    })

    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: { title: '', date: '', status: 'SCHEDULED' },
    })

    const openCreate = () => {
        form.reset({ title: '', date: '', status: 'SCHEDULED' })
        setEditing(null)
        setDialogOpen(true)
    }

    const openEdit = (activity: Activity) => {
        setEditing(activity)
        form.reset({
            title: activity.title,
            description: activity.description,
            date: activity.date,
            startTime: activity.startTime,
            endTime: activity.endTime,
            location: activity.location,
            status: activity.status,
            expectedParticipants: activity.expectedParticipants,
            institutionId: activity.institutionId,
            topicId: activity.topicId,
        })
        setDialogOpen(true)
    }

    const handleSubmit = form.handleSubmit((values) => {
        const payload: CreateActivityDto = {
            ...values,
            institutionId: values.institutionId || undefined,
            topicId: values.topicId || undefined,
        }
        if (editing) {
            updateActivity({ id: editing.id, data: payload })
        } else {
            createActivity(payload)
        }
    })

    const activeFilterLabel = filterInstitutionId
        ? institutions.find((i) => i.id === filterInstitutionId)?.name
        : null

    return (
        <section className="space-y-4 p-4 lg:p-6">
            {/* Filters row */}
            <div className="flex flex-wrap gap-3 items-start">
                <div className="flex-1 min-w-[200px]">
                    <SearchEngine
                        placeholder="Buscar por título o lugar..."
                        value={search}
                        onSearch={setSearch}
                    />
                </div>
                {/* Institution filter */}
                <div className="w-64">
                    <SearchableSelect
                        options={institutionOptions}
                        value={filterInstitutionId}
                        onValueChange={(v) => setFilterInstitutionId(v as number | undefined)}
                        placeholder="Filtrar por institución..."
                        searchPlaceholder="Buscar institución..."
                        emptyLabel="Todas las instituciones"
                    />
                </div>
                <Button onClick={openCreate}>
                    <Plus className="h-4 w-4 mr-1" />
                    Nueva actividad
                </Button>
            </div>

            {/* Active filter pill */}
            {activeFilterLabel && (
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Mostrando:</span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                        <Building2 className="h-3 w-3" />
                        {activeFilterLabel}
                        <button
                            onClick={() => setFilterInstitutionId(undefined)}
                            className="ml-0.5 hover:text-primary/70"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </span>
                    <span className="text-xs text-muted-foreground">({filtered.length} actividad{filtered.length !== 1 ? 'es' : ''})</span>
                </div>
            )}

            {/* Table */}
            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Título</TableHead>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Institución</TableHead>
                            <TableHead>Tema</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead className="w-24">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}>
                                    {Array.from({ length: 6 }).map((_, j) => (
                                        <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : filtered.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                                    No se encontraron actividades
                                </TableCell>
                            </TableRow>
                        ) : (
                            filtered.map((activity) => (
                                <TableRow key={activity.id}>
                                    <TableCell className="font-medium max-w-[200px] truncate">{activity.title}</TableCell>
                                    <TableCell className="whitespace-nowrap">{activity.date}</TableCell>
                                    <TableCell className="max-w-[160px] truncate">{activity.institution?.name || '—'}</TableCell>
                                    <TableCell className="max-w-[120px] truncate">{activity.topic?.name || '—'}</TableCell>
                                    <TableCell>
                                        <Badge variant={statusVariant[activity.status] as any}>
                                            {activityStatusLabels[activity.status]}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7"
                                                title="Gestionar tareas"
                                                onClick={() => navigate(`/activities/${activity.id}/tasks`)}
                                            >
                                                <ClipboardList className="h-3.5 w-3.5 text-primary" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7"
                                                onClick={() => openEdit(activity)}
                                            >
                                                <Pencil className="h-3.5 w-3.5" />
                                            </Button>
                                            <WarningDialog
                                                description={`Eliminar la actividad "${activity.title}". Esta acción no se puede deshacer.`}
                                                onSubmit={() => deleteActivity(activity.id)}
                                            >
                                                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive">
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </WarningDialog>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Form Dialog */}
            <FormDialog
                open={dialogOpen}
                onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditing(null) }}
                title={editing ? 'Editar actividad' : 'Nueva actividad'}
                onSubmit={handleSubmit}
                isPending={isCreating || isUpdating}
            >
                {/* Row 1: Title */}
                <div className="grid gap-1.5">
                    <Label>Título *</Label>
                    <Input {...form.register('title')} placeholder="Ej: Taller de prevención de drogas" />
                    {form.formState.errors.title && <p className="text-xs text-destructive">{form.formState.errors.title.message}</p>}
                </div>

                {/* Row 2: Description */}
                <div className="grid gap-1.5">
                    <Label>Descripción</Label>
                    <Textarea rows={2} {...form.register('description')} placeholder="Breve descripción de la actividad..." />
                </div>

                {/* Row 3: Date + Status */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-1.5">
                        <Label>Fecha *</Label>
                        <Input type="date" {...form.register('date')} />
                        {form.formState.errors.date && <p className="text-xs text-destructive">{form.formState.errors.date.message}</p>}
                    </div>
                    <div className="grid gap-1.5">
                        <Label>Estado</Label>
                        <Select
                            value={form.watch('status')}
                            onValueChange={(v) => form.setValue('status', v as any)}
                        >
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {Object.entries(activityStatusLabels).map(([k, v]) => (
                                    <SelectItem key={k} value={k}>{v}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Row 4: Start time + End time */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-1.5">
                        <Label>Hora inicio</Label>
                        <Input type="time" {...form.register('startTime')} />
                    </div>
                    <div className="grid gap-1.5">
                        <Label>Hora fin</Label>
                        <Input type="time" {...form.register('endTime')} />
                    </div>
                </div>

                {/* Row 5: Location + Expected participants */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-1.5">
                        <Label>Lugar</Label>
                        <Input {...form.register('location')} placeholder="Dirección o nombre del lugar" />
                    </div>
                    <div className="grid gap-1.5">
                        <Label>Participantes esperados</Label>
                        <Input type="number" min={0} {...form.register('expectedParticipants')} />
                    </div>
                </div>

                {/* Row 6: Institution (searchable) */}
                <div className="grid gap-1.5">
                    <Label>Institución educativa</Label>
                    <SearchableSelect
                        options={institutionOptions}
                        value={form.watch('institutionId')}
                        onValueChange={(v) => form.setValue('institutionId', v as number | undefined)}
                        placeholder="Buscar y seleccionar institución..."
                        searchPlaceholder="Escribir nombre del colegio..."
                        emptyLabel="Sin institución"
                    />
                </div>

                {/* Row 7: Topic (searchable) */}
                <div className="grid gap-1.5">
                    <Label>Tema</Label>
                    <SearchableSelect
                        options={topicOptions}
                        value={form.watch('topicId')}
                        onValueChange={(v) => form.setValue('topicId', v as number | undefined)}
                        placeholder="Buscar y seleccionar tema..."
                        searchPlaceholder="Escribir nombre del tema..."
                        emptyLabel="Sin tema"
                    />
                </div>
            </FormDialog>
        </section>
    )
}
