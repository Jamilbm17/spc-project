import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import {
    institutionService,
    type Institution,
    type CreateInstitutionDto,
    institutionTypeLabels,
} from '@/services/institution.service'
import { getHttpErrorMessage } from '@/lib/error'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { SearchEngine } from '@/components/common/SearchEngine'
import { WarningDialog } from '@/components/common/WarningDialog'
import { FormDialog } from '@/components/common/FormDialog'

const schema = z.object({
    name: z.string().min(1, 'Requerido').max(200),
    type: z.enum(['SCHOOL', 'COMMUNITY', 'OTHER']),
    address: z.string().optional(),
    city: z.string().optional(),
    contactName: z.string().optional(),
    contactPhone: z.string().optional(),
    active: z.boolean().optional(),
})

type FormValues = z.infer<typeof schema>

export default function InstitutionsPage() {
    const queryClient = useQueryClient()
    const [search, setSearch] = useState('')
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editing, setEditing] = useState<Institution | null>(null)

    const { data: institutions = [], isLoading } = useQuery({
        queryKey: ['institutions', search],
        queryFn: () => institutionService.findAll(search || undefined),
    })

    const { mutate: createInstitution, isPending: isCreating } = useMutation({
        mutationFn: institutionService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['institutions'] })
            toast.success('Institución creada correctamente')
            setDialogOpen(false)
        },
        onError: (err) => toast.error('Error al crear', { description: getHttpErrorMessage(err) }),
    })

    const { mutate: updateInstitution, isPending: isUpdating } = useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<CreateInstitutionDto> }) =>
            institutionService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['institutions'] })
            toast.success('Institución actualizada')
            setDialogOpen(false)
            setEditing(null)
        },
        onError: (err) => toast.error('Error al actualizar', { description: getHttpErrorMessage(err) }),
    })

    const { mutate: deleteInstitution } = useMutation({
        mutationFn: institutionService.remove,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['institutions'] })
            toast.success('Institución eliminada')
        },
        onError: (err) => toast.error('Error al eliminar', { description: getHttpErrorMessage(err) }),
    })

    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: { name: '', type: 'SCHOOL' },
    })

    const openCreate = () => {
        form.reset({ name: '', type: 'SCHOOL' })
        setEditing(null)
        setDialogOpen(true)
    }

    const openEdit = (inst: Institution) => {
        setEditing(inst)
        form.reset({
            name: inst.name,
            type: inst.type,
            address: inst.address,
            city: inst.city,
            contactName: inst.contactName,
            contactPhone: inst.contactPhone,
            active: inst.active,
        })
        setDialogOpen(true)
    }

    const handleSubmit = form.handleSubmit((values) => {
        if (editing) {
            updateInstitution({ id: editing.id, data: values })
        } else {
            createInstitution(values as CreateInstitutionDto)
        }
    })

    return (
        <section className="space-y-6 p-4 lg:p-6">
            <div className="flex justify-between gap-4 md:flex-row flex-col">
                <div className="flex-1">
                    <SearchEngine
                        placeholder="Buscar por nombre o ciudad..."
                        value={search}
                        onSearch={setSearch}
                    />
                </div>
                <Button onClick={openCreate} className="w-fit">
                    <Plus />
                    Nueva institución
                </Button>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Ciudad</TableHead>
                            <TableHead>Contacto</TableHead>
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
                        ) : institutions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                                    No se encontraron instituciones
                                </TableCell>
                            </TableRow>
                        ) : (
                            institutions.map((inst) => (
                                <TableRow key={inst.id}>
                                    <TableCell className="font-medium">{inst.name}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{institutionTypeLabels[inst.type]}</Badge>
                                    </TableCell>
                                    <TableCell>{inst.city || '—'}</TableCell>
                                    <TableCell>{inst.contactName || '—'}</TableCell>
                                    <TableCell>
                                        <Badge variant={inst.active ? 'success' : 'muted'}>
                                            {inst.active ? 'Activo' : 'Inactivo'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-1">
                                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(inst)}>
                                                <Pencil className="h-3.5 w-3.5" />
                                            </Button>
                                            <WarningDialog
                                                description={`Eliminar la institución "${inst.name}". Esta acción no se puede deshacer.`}
                                                onSubmit={() => deleteInstitution(inst.id)}
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
                title={editing ? 'Editar institución' : 'Nueva institución'}
                onSubmit={handleSubmit}
                isPending={isCreating || isUpdating}
            >
                <div className="grid gap-1.5">
                    <Label>Nombre *</Label>
                    <Input {...form.register('name')} />
                    {form.formState.errors.name && <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>}
                </div>
                <div className="grid gap-1.5">
                    <Label>Tipo *</Label>
                    <Select
                        value={form.watch('type')}
                        onValueChange={(v) => form.setValue('type', v as any)}
                    >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {Object.entries(institutionTypeLabels).map(([k, v]) => (
                                <SelectItem key={k} value={k}>{v}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-1.5">
                        <Label>Ciudad</Label>
                        <Input {...form.register('city')} />
                    </div>
                    <div className="grid gap-1.5">
                        <Label>Dirección</Label>
                        <Input {...form.register('address')} />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-1.5">
                        <Label>Nombre de contacto</Label>
                        <Input {...form.register('contactName')} />
                    </div>
                    <div className="grid gap-1.5">
                        <Label>Teléfono de contacto</Label>
                        <Input {...form.register('contactPhone')} />
                    </div>
                </div>
            </FormDialog>
        </section>
    )
}
