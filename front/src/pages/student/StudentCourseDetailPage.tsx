import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
    ArrowLeft,
    BookOpen,
    FileText,
    Image,
    Users,
    LogOut,
    Clock,
    Star,
    Eye,
} from 'lucide-react'
import { courseStudentService, type Post } from '@/services/course.service'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { WarningDialog } from '@/components/common/WarningDialog'

const SKELETON_IDS = ['sk-a', 'sk-b', 'sk-c']

export default function StudentCourseDetailPage() {
    const { id } = useParams<{ id: string }>()
    const courseId = Number(id)
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    const { data: course, isLoading } = useQuery({
        queryKey: ['student-course-detail', courseId],
        queryFn: () => courseStudentService.findOne(courseId),
        enabled: !Number.isNaN(courseId),
    })

    const { data: enrollment } = useQuery({
        queryKey: ['student-course-check', courseId],
        queryFn: () => courseStudentService.checkEnrollment(courseId),
        enabled: !Number.isNaN(courseId),
    })

    const unenrollMutation = useMutation({
        mutationFn: () => courseStudentService.unenroll(courseId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['student-my-courses'] })
            queryClient.invalidateQueries({ queryKey: ['student-course-check', courseId] })
            toast.success('Te has dado de baja del curso')
            navigate('/student/courses')
        },
        onError: () => toast.error('Error al cancelar la inscripción'),
    })

    if (isLoading) {
        return (
            <section className="p-4 lg:p-6 space-y-4">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-24 w-full rounded-xl" />
                {SKELETON_IDS.map((sid) => (
                    <Skeleton key={sid} className="h-36 w-full rounded-xl" />
                ))}
            </section>
        )
    }

    if (!course) {
        return (
            <section className="p-4 lg:p-6">
                <p className="text-muted-foreground">Curso no encontrado.</p>
            </section>
        )
    }

    const posts: Post[] = course.posts ?? []
    const isEnrolled = enrollment?.enrolled ?? false

    function renderPostsContent() {
        if (posts.length === 0) {
            return (
                <div className="text-center text-muted-foreground py-16 border rounded-xl border-dashed">
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm font-medium">Aún no hay publicaciones en este curso</p>
                    <p className="text-xs mt-1">El docente publicará contenido próximamente</p>
                </div>
            )
        }
        return (
            <div className="space-y-4">
                {posts.map((post) => (
                    <article key={post.id} className="border rounded-xl overflow-hidden bg-card shadow-sm">
                        {post.imageUrl && (
                            <div className="h-52 overflow-hidden">
                                <img
                                    src={post.imageUrl}
                                    alt={post.title}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        if (e.currentTarget.parentElement) {
                                            e.currentTarget.parentElement.style.display = 'none'
                                        }
                                    }}
                                />
                            </div>
                        )}
                        <div className="p-4 space-y-3">
                            <div className="flex items-start gap-2">
                                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                                    <FileText className="h-4 w-4 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-sm">{post.title}</h3>
                                    <p className="text-xs text-muted-foreground">
                                        {format(new Date(post.createdAt), "d 'de' MMMM yyyy, HH:mm", { locale: es })}
                                    </p>
                                </div>
                            </div>

                            {/* dueDate + maxScore badges */}
                            {(post.dueDate || post.maxScore != null) && (
                                <div className="flex flex-wrap gap-1.5 pl-10">
                                    {post.dueDate && (
                                        <Badge variant="outline" className="gap-1 text-xs">
                                            <Clock className="h-3 w-3" />
                                            Entrega: {format(new Date(post.dueDate + 'T00:00:00'), "d MMM yyyy", { locale: es })}
                                        </Badge>
                                    )}
                                    {post.maxScore != null && (
                                        <Badge variant="outline" className="gap-1 text-xs">
                                            <Star className="h-3 w-3" />
                                            {post.maxScore} pts
                                        </Badge>
                                    )}
                                </div>
                            )}

                            <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed pl-10">
                                {post.content}
                            </p>

                            <div className="flex items-center gap-2 pl-10">
                                {post.imageUrl && (
                                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
                                        <Image className="h-3 w-3" />
                                        Imagen adjunta
                                    </span>
                                )}
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="ml-auto gap-1.5 h-7 text-xs"
                                    onClick={() => navigate(`/student/tasks/${post.id}`)}
                                >
                                    <Eye className="h-3.5 w-3.5" />
                                    Ver / Responder
                                </Button>
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        )
    }

    return (
        <section className="p-4 lg:p-6 space-y-6">
            {/* Header */}
            <div className="flex items-start gap-3">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 mt-0.5 flex-shrink-0"
                    onClick={() => navigate('/student/courses')}
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <h1 className="text-xl font-bold">{course.title}</h1>
                        {isEnrolled && <Badge className="text-xs">Inscrito</Badge>}
                    </div>
                    {course.description && (
                        <p className="text-sm text-muted-foreground mt-1">{course.description}</p>
                    )}
                    <div className="flex flex-wrap gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <BookOpen className="h-3 w-3" />
                            Docente: <span className="font-medium ml-1">{course.teacher?.name}</span>
                        </span>
                        <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {course.enrollmentCount ?? 0} inscritos
                        </span>
                    </div>
                </div>
                {isEnrolled && (
                    <WarningDialog
                        description="¿Deseas cancelar tu inscripción en este curso? Perderás acceso al contenido."
                        onSubmit={() => unenrollMutation.mutate()}
                    >
                        <Button variant="outline" size="sm" className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10 flex-shrink-0">
                            <LogOut className="h-3.5 w-3.5" />
                            Salir del curso
                        </Button>
                    </WarningDialog>
                )}
            </div>

            {/* Cover image */}
            {course.imageUrl && (
                <div className="h-48 rounded-xl overflow-hidden">
                    <img
                        src={course.imageUrl}
                        alt={course.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            if (e.currentTarget.parentElement) {
                                e.currentTarget.parentElement.style.display = 'none'
                            }
                        }}
                    />
                </div>
            )}

            <Separator />

            {/* Publicaciones */}
            <div className="space-y-4">
                <h2 className="text-base font-semibold flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    Publicaciones ({posts.length})
                </h2>

                {isEnrolled ? renderPostsContent() : (
                    <div className="text-center text-muted-foreground py-16 border rounded-xl border-dashed">
                        <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-30" />
                        <p className="text-sm font-medium">Debes estar inscrito para ver el contenido</p>
                        <Button className="mt-4" size="sm" onClick={() => navigate('/student/courses')}>
                            Volver a cursos
                        </Button>
                    </div>
                )}
            </div>
        </section>
    )
}
