import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { resolveUploadUrl } from '@/lib/api'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { BookOpen, ChevronRight, FileText, LogOut } from 'lucide-react'
import { courseStudentService, type Course, type Post } from '@/services/course.service'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { WarningDialog } from '@/components/common/WarningDialog'

export default function StudentMyCoursesPage() {
    const queryClient = useQueryClient()
    const navigate = useNavigate()

    const { data: myCourses = [], isLoading } = useQuery({
        queryKey: ['student-my-courses'],
        queryFn: () => courseStudentService.findMyCourses(),
    })

    const unenrollMutation = useMutation({
        mutationFn: (courseId: number) => courseStudentService.unenroll(courseId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['student-my-courses'] })
            toast.success('Cancelaste la inscripción')
        },
        onError: () => toast.error('Error al cancelar'),
    })

    return (
        <section className="p-4 lg:p-6 space-y-6">
            <div>
                <h1 className="text-xl font-bold flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    Mis cursos
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                    Cursos en los que estás inscrito
                </p>
            </div>

            {isLoading ? (
                <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-36 w-full rounded-xl" />
                    ))}
                </div>
            ) : myCourses.length === 0 ? (
                <div className="text-center text-muted-foreground py-20 border rounded-xl">
                    <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">Aún no estás inscrito en ningún curso</p>
                    <Button
                        size="sm"
                        className="mt-4"
                        onClick={() => navigate('/student/courses')}
                    >
                        Explorar cursos
                    </Button>
                </div>
            ) : (
                <div className="space-y-4">
                    {(myCourses as (Course & { posts: Post[] })[]).map((course) => (
                        <div key={course.id} className="border rounded-xl bg-card overflow-hidden">
                            <div className="flex items-start gap-4 p-4">
                                {/* Icon / cover */}
                                <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                    {course.imageUrl ? (
                                        <img
                                            src={resolveUploadUrl(course.imageUrl)}
                                            alt={course.title}
                                            className="w-full h-full object-cover"
                                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                                        />
                                    ) : (
                                        <BookOpen className="h-6 w-6 text-primary/40" />
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <h3 className="font-semibold text-sm">{course.title}</h3>
                                            {course.description && (
                                                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                                    {course.description}
                                                </p>
                                            )}
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Docente: <span className="font-medium">{course.teacher?.name}</span>
                                            </p>
                                        </div>
                                        <WarningDialog
                                            description={`¿Salir del curso "${course.title}"?`}
                                            onSubmit={() => unenrollMutation.mutate(course.id)}
                                        >
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 text-muted-foreground hover:text-destructive flex-shrink-0"
                                                title="Salir del curso"
                                            >
                                                <LogOut className="h-3.5 w-3.5" />
                                            </Button>
                                        </WarningDialog>
                                    </div>

                                    {/* Last posts preview */}
                                    {course.posts && course.posts.length > 0 && (
                                        <div className="mt-2 space-y-1">
                                            {course.posts.slice(0, 2).map((post) => (
                                                <div key={post.id} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                    <FileText className="h-3 w-3 flex-shrink-0" />
                                                    <span className="truncate">{post.title}</span>
                                                    <span className="flex-shrink-0 ml-auto">
                                                        {format(new Date(post.createdAt), "d MMM", { locale: es })}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="border-t px-4 py-2 flex items-center justify-between">
                                <Badge variant="outline" className="text-xs">
                                    {course.posts?.length ?? 0} publicaciones
                                </Badge>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="gap-1 text-xs h-7 text-primary"
                                    onClick={() => navigate(`/student/courses/${course.id}`)}
                                >
                                    Abrir curso
                                    <ChevronRight className="h-3 w-3" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    )
}
