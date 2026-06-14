import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { resolveUploadUrl } from '@/lib/api'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import {
    Plus,
    BookOpen,
    Users,
    Pencil,
    Trash2,
    Eye,
    ToggleLeft,
    ToggleRight,
    Search,
} from 'lucide-react'
import { courseAdminService, type Course } from '@/services/course.service'
import { ImageUpload } from '@/components/common/ImageUpload'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { WarningDialog } from '@/components/common/WarningDialog'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const courseSchema = z.object({
    title: z.string().min(1, 'El título es requerido'),
    description: z.string().optional(),
    imageUrl: z.string().optional(),
})
type CourseForm = z.infer<typeof courseSchema>

export default function CoursesPage() {
    const queryClient = useQueryClient()
    const navigate = useNavigate()
    const [search, setSearch] = useState('')
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editing, setEditing] = useState<Course | null>(null)

    const { data: courses = [], isLoading } = useQuery({
        queryKey: ['admin-courses', search],
        queryFn: () => courseAdminService.findAll(search || undefined),
    })

    const { register, handleSubmit, reset, control, watch, setValue, formState: { errors } } = useForm<CourseForm>({
        resolver: zodResolver(courseSchema),
    })

    const imageUrl = watch('imageUrl')

    const createMutation = useMutation({
        mutationFn: (data: CourseForm) => courseAdminService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-courses'] })
            toast.success('Curso creado exitosamente')
            setDialogOpen(false)
            reset()
        },
        onError: () => toast.error('Error al crear el curso'),
    })

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: CourseForm }) =>
            courseAdminService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-courses'] })
            toast.success('Curso actualizado')
            setDialogOpen(false)
            setEditing(null)
            reset()
        },
        onError: () => toast.error('Error al actualizar el curso'),
    })

    const toggleMutation = useMutation({
        mutationFn: (course: Course) =>
            courseAdminService.update(course.id, { isActive: !course.isActive }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-courses'] }),
        onError: () => toast.error('Error al cambiar el estado'),
    })

    const removeMutation = useMutation({
        mutationFn: (id: number) => courseAdminService.remove(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-courses'] })
            toast.success('Curso eliminado')
        },
        onError: () => toast.error('Error al eliminar el curso'),
    })

    function openCreate() {
        setEditing(null)
        reset({ title: '', description: '', imageUrl: '' })
        setDialogOpen(true)
    }

    function openEdit(course: Course) {
        setEditing(course)
        reset({
            title: course.title,
            description: course.description ?? '',
            imageUrl: course.imageUrl ?? '',
        })
        setDialogOpen(true)
    }

    function onSubmit(data: CourseForm) {
        const payload = { ...data, imageUrl: data.imageUrl || undefined }
        if (editing) {
            updateMutation.mutate({ id: editing.id, data: payload })
        } else {
            createMutation.mutate(payload)
        }
    }

    const isMutating = createMutation.isPending || updateMutation.isPending

    return (
        <section className="p-4 lg:p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl font-bold flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-primary" />
                        Gestión de Cursos
                    </h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Crea y administra cursos del portal Blackboard
                    </p>
                </div>
                <Button onClick={openCreate} className="gap-2 self-start sm:self-auto">
                    <Plus className="h-4 w-4" />
                    Nuevo curso
                </Button>
            </div>

            {/* Search */}
            <div className="relative max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Buscar cursos..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-8"
                />
            </div>

            {/* Grid de cursos */}
            {isLoading ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="h-52 rounded-xl" />
                    ))}
                </div>
            ) : courses.length === 0 ? (
                <div className="text-center text-muted-foreground py-20 border rounded-xl">
                    <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">No hay cursos registrados</p>
                    <p className="text-sm mt-1">Crea el primer curso para empezar</p>
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {courses.map((course) => (
                        <div
                            key={course.id}
                            className="border rounded-xl overflow-hidden bg-card flex flex-col"
                        >
                            {/* Cover */}
                            <div className="h-28 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center relative">
                                {course.imageUrl ? (
                                    <img
                                        src={resolveUploadUrl(course.imageUrl)}
                                        alt={course.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <BookOpen className="h-10 w-10 text-primary/40" />
                                )}
                                <div className="absolute top-2 right-2">
                                    <Badge variant={course.isActive ? 'default' : 'secondary'}>
                                        {course.isActive ? 'Activo' : 'Inactivo'}
                                    </Badge>
                                </div>
                            </div>

                            {/* Body */}
                            <div className="p-4 flex-1 flex flex-col gap-2">
                                <h3 className="font-semibold text-sm leading-tight line-clamp-2">
                                    {course.title}
                                </h3>
                                {course.description && (
                                    <p className="text-xs text-muted-foreground line-clamp-2">
                                        {course.description}
                                    </p>
                                )}
                                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-auto pt-2">
                                    <Users className="h-3 w-3" />
                                    <span>{course.enrollmentCount ?? 0} inscritos</span>
                                    <span className="ml-auto">
                                        {format(new Date(course.createdAt), "d MMM yyyy", { locale: es })}
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Docente: <span className="font-medium">{course.teacher?.name}</span>
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="border-t px-4 py-2 flex items-center gap-1">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="gap-1 text-xs h-7"
                                    onClick={() => navigate(`/courses/${course.id}`)}
                                >
                                    <Eye className="h-3 w-3" />
                                    Ver publicaciones
                                </Button>
                                <div className="ml-auto flex gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7"
                                        onClick={() => toggleMutation.mutate(course)}
                                        title={course.isActive ? 'Desactivar' : 'Activar'}
                                    >
                                        {course.isActive
                                            ? <ToggleRight className="h-4 w-4 text-primary" />
                                            : <ToggleLeft className="h-4 w-4 text-muted-foreground" />}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7"
                                        onClick={() => openEdit(course)}
                                    >
                                        <Pencil className="h-3.5 w-3.5" />
                                    </Button>
                                    <WarningDialog
                                        description={`¿Eliminar el curso "${course.title}"? Se borrarán todas sus publicaciones e inscripciones.`}
                                        onSubmit={() => removeMutation.mutate(course.id)}
                                    >
                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive">
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </WarningDialog>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Dialog crear / editar */}
            <Dialog open={dialogOpen} onOpenChange={(v) => { setDialogOpen(v); if (!v) setEditing(null) }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editing ? 'Editar curso' : 'Nuevo curso'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="title">Título *</Label>
                            <Input id="title" {...register('title')} placeholder="Ej: Seguridad Vial" />
                            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="description">Descripción</Label>
                            <Textarea
                                id="description"
                                {...register('description')}
                                placeholder="Descripción del curso..."
                                rows={3}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Imagen de portada</Label>
                            <Controller
                                control={control}
                                name="imageUrl"
                                render={() => (
                                    <ImageUpload
                                        value={imageUrl || undefined}
                                        onChange={(url) => setValue('imageUrl', url ?? '')}
                                    />
                                )}
                            />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isMutating}>
                                {isMutating ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear curso'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </section>
    )
}
