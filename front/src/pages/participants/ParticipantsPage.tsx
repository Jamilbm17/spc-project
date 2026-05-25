import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import {
    participantService,
    type Participant,
    type CreateParticipantDto,
} from '@/services/participant.service'
import { institutionService } from '@/services/institution.service'
import { getHttpErrorMessage } from '@/lib/error'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { SearchEngine } from '@/components/common/SearchEngine'
import { WarningDialog } from '@/components/common/WarningDialog'
import { FormDialog } from '@/components/common/FormDialog'

const schema = z.object({
    name: z.string().min(1, 'Requerido').max(200),
    documentNumber: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email('Correo inválido').optional().or(z.literal('')),
    age: z.coerce.number().min(1).optional(),
    institutionId: z.coerce.number().optional(),
})

type FormValues = z.infer<typeof schema>

export default function ParticipantsPage() {
    const queryClient = useQueryClient()
    const [search, setSearch] = useState('')
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editing, setEditing] = useState<Participant | null>(null)

    const { data: participants = [], isLoading } = useQuery({
        queryKey: ['participants', search],
        queryFn: () => participantService.findAll(search || undefined),
    })

    const { data: institutions = [] } = useQuery({
        queryKey: ['institutions'],
        queryFn: () => institutionService.findAll(),
    })

    const { mutate: createParticipant, isPending: isCreating } = useMutation({
        mutationFn: participantService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['participants'] })
            toast.success('Participante creado correctamente')
            setDialogOpen(false)
        },
        onError: (err) => toast.error('Error al crear', { description: getHttpErrorMessage(err) }),
    })

    const { mutate: updateParticipant, isPending: isUpdating } = useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<CreateParticipantDto> }) =>
            participantService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['participants'] })
            toast.success('Participante actualizado')
            setDialogOpen(false)
            setEditing(null)
        },
        onError: (err) => toast.error('Error al actualizar', { description: getHttpErrorMessage(err) }),
    })

    const { mutate: deleteParticipant } = useMutation({
        mutationFn: participantService.remove,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['participants'] })
            toast.success('Participante eliminado')
        },
        onError: (err) => toast.error('Error al eliminar', { description: getHttpErrorMessage(err) }),
    })

    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: { name: '' },
    })

    const openCreate = () => {
        form.reset({ name: '' })
        setEditing(null)
        setDialogOpen(true)
    }

    const openEdit = (p: Participant) => {
        setEditing(p)
        form.reset({
            name: p.name,
            documentNumber: p.documentNumber,
            phone: p.phone,
            email: p.email,
            age: p.age,
            institutionId: p.institutionId,
        })
        setDialogOpen(true)
    }

    const handleSubmit = form.handleSubmit((values) => {
        const payload = {
            ...values,
            email: values.email || undefined,
            institutionId: values.institutionId || undefined,
        }
        if (editing) {
            updateParticipant({ id: editing.id, data: payload })
        } else {
            createParticipant(payload as CreateParticipantDto)
        }
    })

    return (
        <section className="space-y-6 p-4 lg:p-6">
            <div className="flex justify-between gap-4 md:flex-row flex-col">
                <div className="flex-1">
                    <SearchEngine
                        placeholder="Buscar por nombre o DNI..."
                        value={search}
                        onSearch={setSearch}
                    />
                </div>
                <Button onClick={openCreate} className="w-fit">
                    <Plus />
                    Nuevo participante
                </Button>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nombre</TableHead>
                            <TableHead>DNI / Documento</TableHead>
                            <TableHead>Teléfono</TableHead>
                            <TableHead>Institución</TableHead>
                            <TableHead>Edad</TableHead>
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
                        ) : participants.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                                    No se encontraron participantes
                                </TableCell>
                            </TableRow>
                        ) : (
                            participants.map((p) => (
                                <TableRow key={p.id}>
                                    <TableCell className="font-medium">{p.name}</TableCell>
                                    <TableCell>{p.documentNumber || '—'}</TableCell>
                                    <TableCell>{p.phone || '—'}</TableCell>
                                    <TableCell>{p.institution?.name || '—'}</TableCell>
                                    <TableCell>{p.age || '—'}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-1">
                                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(p)}>
                                                <Pencil className="h-3.5 w-3.5" />
                                            </Button>
                                            <WarningDialog
                                                description={`Eliminar al participante "${p.name}". Esta acción no se puede deshacer.`}
                                                onSubmit={() => deleteParticipant(p.id)}
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

            <FormDialog
                open={dialogOpen}
                onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditing(null) }}
                title={editing ? 'Editar participante' : 'Nuevo participante'}
                onSubmit={handleSubmit}
                isPending={isCreating || isUpdating}
            >
                <div className="grid gap-1.5">
                    <Label>Nombre *</Label>
                    <Input {...form.register('name')} />
                    {form.formState.errors.name && <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-1.5">
                        <Label>N° Documento</Label>
                        <Input {...form.register('documentNumber')} />
                    </div>
                    <div className="grid gap-1.5">
                        <Label>Edad</Label>
                        <Input type="number" min={1} {...form.register('age')} />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-1.5">
                        <Label>Teléfono</Label>
                        <Input {...form.register('phone')} />
                    </div>
                    <div className="grid gap-1.5">
                        <Label>Correo electrónico</Label>
                        <Input type="email" {...form.register('email')} />
                        {form.formState.errors.email && <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>}
                    </div>
                </div>
                <div className="grid gap-1.5">
                    <Label>Institución</Label>
                    <Select
                        value={form.watch('institutionId')?.toString() || ''}
                        onValueChange={(v) => form.setValue('institutionId', v ? Number(v) : undefined)}
                    >
                        <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                        <SelectContent>
                            {institutions.map((inst) => (
                                <SelectItem key={inst.id} value={inst.id.toString()}>{inst.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </FormDialog>
        </section>
    )
}
