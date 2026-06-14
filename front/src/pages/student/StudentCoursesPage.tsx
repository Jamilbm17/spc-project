import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { resolveUploadUrl } from '@/lib/api'
import { toast } from 'sonner'
import { Search, BookOpen, Users, ChevronRight, CheckCircle2 } from 'lucide-react'
import { courseStudentService, type Course } from '@/services/course.service'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export default function StudentCoursesPage() {
    const queryClient = useQueryClient()
    const navigate = useNavigate()
    const [search, setSearch] = useState('')

    const { data: courses = [], isLoading } = useQuery({
        queryKey: ['student-courses', search],
        queryFn: () => courseStudentService.findAll(search || undefined),
    })

    const { data: myCourses = [] } = useQuery({
        queryKey: ['student-my-courses'],
        queryFn: () => courseStudentService.findMyCourses(),
    })

    const enrolledIds = new Set(myCourses.map((c) => c.id))

    const enrollMutation = useMutation({
        mutationFn: (courseId: number) => courseStudentService.enroll(courseId),
        onSuccess: (_, courseId) => {
            queryClient.invalidateQueries({ queryKey: ['student-my-courses'] })
            toast.success('¡Te has inscrito al curso!')
            navigate(`/student/courses/${courseId}`)
        },
        onError: (err: any) => {
            const msg = err?.response?.data?.message ?? 'Error al inscribirse'
            toast.error(msg)
        },
    })

    return (
        <section className="p-4 lg:p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-xl font-bold flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    Cursos disponibles
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                    Inscríbete en los cursos que te interesen y accede a su contenido
                </p>
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
                        <Skeleton key={i} className="h-60 rounded-xl" />
                    ))}
                </div>
            ) : courses.length === 0 ? (
                <div className="text-center text-muted-foreground py-20 border rounded-xl">
                    <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">No hay cursos disponibles</p>
                    <p className="text-sm mt-1">Vuelve más tarde para ver nuevos cursos</p>
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {courses.map((course: Course) => {
                        const enrolled = enrolledIds.has(course.id)
                        return (
                            <div
                                key={course.id}
                                className={cn(
                                    'border rounded-xl overflow-hidden bg-card flex flex-col transition-shadow hover:shadow-md',
                                    enrolled && 'border-primary/50 ring-1 ring-primary/20',
                                )}
                            >
                                {/* Cover */}
                                <div className="h-32 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center relative">
                                    {course.imageUrl ? (
                                        <img
                                            src={resolveUploadUrl(course.imageUrl)}
                                            alt={course.title}
                                            className="w-full h-full object-cover"
                                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                                        />
                                    ) : (
                                        <BookOpen className="h-10 w-10 text-primary/40" />
                                    )}
                                    {enrolled && (
                                        <div className="absolute top-2 right-2">
                                            <Badge className="gap-1 text-xs">
                                                <CheckCircle2 className="h-3 w-3" />
                                                Inscrito
                                            </Badge>
                                        </div>
                                    )}
                                </div>

                                {/* Body */}
                                <div className="p-4 flex-1 flex flex-col gap-2">
                                    <h3 className="font-semibold text-sm leading-snug line-clamp-2">
                                        {course.title}
                                    </h3>
                                    {course.description && (
                                        <p className="text-xs text-muted-foreground line-clamp-3">
                                            {course.description}
                                        </p>
                                    )}
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-auto pt-2">
                                        <Users className="h-3 w-3" />
                                        <span>{course.enrollmentCount ?? 0} inscritos</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Docente: <span className="font-medium">{course.teacher?.name}</span>
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className="border-t px-4 py-3 flex gap-2">
                                    {enrolled ? (
                                        <Button
                                            size="sm"
                                            className="flex-1 gap-1.5"
                                            onClick={() => navigate(`/student/courses/${course.id}`)}
                                        >
                                            Ver contenido
                                            <ChevronRight className="h-3.5 w-3.5" />
                                        </Button>
                                    ) : (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="flex-1"
                                            disabled={enrollMutation.isPending}
                                            onClick={() => enrollMutation.mutate(course.id)}
                                        >
                                            Inscribirse
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </section>
    )
}
