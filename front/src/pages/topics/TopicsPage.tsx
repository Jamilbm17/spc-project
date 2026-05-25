import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Pencil, Trash2, BookOpen } from 'lucide-react'
import { toast } from 'sonner'
import {
    topicService,
    type Topic,
    type CreateTopicDto,
} from '@/services/topic.service'
import { getHttpErrorMessage } from '@/lib/error'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { SearchEngine } from '@/components/common/SearchEngine'
import { WarningDialog } from '@/components/common/WarningDialog'
import { FormDialog } from '@/components/common/FormDialog'

const schema = z.object({
    name: z.string().min(1, 'Requerido').max(150),
    description: z.string().optional(),
    active: z.boolean().optional(),
})

type FormValues = z.infer<typeof schema>

export default function TopicsPage() {
    const queryClient = useQueryClient()
    const [search, setSearch] = useState('')
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editing, setEditing] = useState<Topic | null>(null)

    const { data: topics = [], isLoading } = useQuery({
        queryKey: ['topics', search],
        queryFn: () => topicService.findAll(search || undefined),
    })

    const { mutate: createTopic, isPending: isCreating } = useMutation({
        mutationFn: topicService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['topics'] })
            toast.success('Tema creado correctamente')
            setDialogOpen(false)
        },
        onError: (err) => toast.error('Error al crear', { description: getHttpErrorMessage(err) }),
    })

    const { mutate: updateTopic, isPending: isUpdating } = useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<CreateTopicDto> }) =>
            topicService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['topics'] })
            toast.success('Tema actualizado')
            setDialogOpen(false)
            setEditing(null)
        },
        onError: (err) => toast.error('Error al actualizar', { description: getHttpErrorMessage(err) }),
    })

    const { mutate: deleteTopic } = useMutation({
        mutationFn: topicService.remove,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['topics'] })
            toast.success('Tema eliminado')
        },
        onError: (err) => toast.error('Error al eliminar', { description: getHttpErrorMessage(err) }),
    })

    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: { name: '', active: true },
    })

    const openCreate = () => {
        form.reset({ name: '', active: true })
        setEditing(null)
        setDialogOpen(true)
    }

    const openEdit = (topic: Topic) => {
        setEditing(topic)
        form.reset({ name: topic.name, description: topic.description, active: topic.active })
        setDialogOpen(true)
    }

    const handleSubmit = form.handleSubmit((values) => {
        if (editing) {
            updateTopic({ id: editing.id, data: values })
        } else {
            createTopic(values as CreateTopicDto)
        }
    })

    return (
        <section className="space-y-6 p-4 lg:p-6">
            <div className="flex justify-between gap-4 md:flex-row flex-col">
                <div className="flex-1">
                    <SearchEngine
                        placeholder="Buscar por nombre o descripción..."
                        value={search}
                        onSearch={setSearch}
                    />
                </div>
                <Button onClick={openCreate} className="w-fit">
                    <Plus className="h-4 w-4 mr-1" />
                    Nuevo tema
                </Button>
            </div>

            {/* Count */}
            {!isLoading && (
                <p className="text-sm text-muted-foreground">
                    {topics.length} tema{topics.length !== 1 ? 's' : ''} encontrado{topics.length !== 1 ? 's' : ''}
                </p>
            )}

            {/* Card grid */}
            {isLoading ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="h-28 rounded-xl" />
                    ))}
                </div>
            ) : topics.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 border rounded-xl text-muted-foreground gap-3">
                    <BookOpen className="h-10 w-10 opacity-30" />
                    <p className="text-sm">No se encontraron temas</p>
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {topics.map((topic) => (
                        <div
                            key={topic.id}
                            className="group relative rounded-xl border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
                        >
                            {/* Top row: icon + badge + actions */}
                            <div className="flex items-start justify-between gap-2 mb-3">
                                <div className="flex items-center gap-2">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${topic.active ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                                        <BookOpen className="h-4 w-4" />
                                    </div>
                                    <Badge variant={topic.active ? 'success' : 'muted'} className="text-xs">
                                        {topic.active ? 'Activo' : 'Inactivo'}
                                    </Badge>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7"
                                        onClick={() => openEdit(topic)}
                                    >
                                        <Pencil className="h-3.5 w-3.5" />
                                    </Button>
                                    <WarningDialog
                                        description={`Eliminar el tema "${topic.name}". Esta acción no se puede deshacer.`}
                                        onSubmit={() => deleteTopic(topic.id)}
                                    >
                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive">
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </WarningDialog>
                                </div>
                            </div>
                            {/* Topic name */}
                            <p className="font-semibold text-sm leading-snug mb-1 line-clamp-2">{topic.name}</p>
                            {/* Description */}
                            {topic.description ? (
                                <p className="text-xs text-muted-foreground line-clamp-2">{topic.description}</p>
                            ) : (
                                <p className="text-xs text-muted-foreground/50 italic">Sin descripción</p>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <FormDialog
                open={dialogOpen}
                onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditing(null) }}
                title={editing ? 'Editar tema' : 'Nuevo tema'}
                onSubmit={handleSubmit}
                isPending={isCreating || isUpdating}
            >
                <div className="grid gap-1.5">
                    <Label>Nombre *</Label>
                    <Input {...form.register('name')} placeholder="Ej: Prevención de drogas" />
                    {form.formState.errors.name && (
                        <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
                    )}
                </div>
                <div className="grid gap-1.5">
                    <Label>Descripción</Label>
                    <Textarea
                        rows={3}
                        {...form.register('description')}
                        placeholder="Breve descripción del tema abordado..."
                    />
                </div>
            </FormDialog>
        </section>
    )
}
