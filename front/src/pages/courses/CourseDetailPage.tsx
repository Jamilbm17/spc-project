import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, Controller, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
    ArrowLeft, Plus, Trash2, Pencil, FileText, Users, Image,
    ChevronDown, ChevronUp, CheckCircle2, ListChecks, BarChart2, Clock, Star,
} from 'lucide-react'
import { courseAdminService, type Post, type Question, type QuestionType, type TaskSubmission } from '@/services/course.service'
import { ImageUpload } from '@/components/common/ImageUpload'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { WarningDialog } from '@/components/common/WarningDialog'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'

// ── Schemas ────────────────────────────────────────────────────────────────

const postSchema = z.object({
    title: z.string().min(1, 'El título es requerido'),
    content: z.string().min(1, 'El contenido es requerido'),
    imageUrl: z.string().optional(),
    dueDate: z.string().optional(),
    maxScore: z.coerce.number().min(0).max(20).optional().or(z.literal('')),
})
type PostForm = z.infer<typeof postSchema>

const questionSchema = z.object({
    text: z.string().min(1, 'El enunciado es requerido'),
    type: z.enum(['OPEN_TEXT', 'MULTIPLE_CHOICE', 'POLL']),
    options: z.array(z.object({ value: z.string() })).optional(),
    correctOptionIndex: z.coerce.number().optional().nullable(),
    points: z.coerce.number().min(0).optional().or(z.literal('')),
})
type QuestionForm = z.infer<typeof questionSchema>

// ── Inline question draft ─────────────────────────────────────────────────

interface QuestionDraft {
    draftId: string
    text: string
    type: QuestionType
    options: string[]
    correctOptionIndex: number | null
    points: number | null
}

const SKELETON_IDS = ['sk-a', 'sk-b', 'sk-c']
let draftSeq = 0

function newDraft(): QuestionDraft {
    draftSeq += 1
    return { draftId: `cd${draftSeq}`, text: '', type: 'OPEN_TEXT', options: ['', ''], correctOptionIndex: null, points: null }
}

function patchDraft(prev: QuestionDraft[], id: string, patch: Partial<QuestionDraft>): QuestionDraft[] {
    return prev.map((q) => (q.draftId === id ? { ...q, ...patch } : q))
}
function patchDraftOption(prev: QuestionDraft[], id: string, oi: number, val: string): QuestionDraft[] {
    return prev.map((q) => (q.draftId === id ? { ...q, options: q.options.map((o, i) => (i === oi ? val : o)) } : q))
}
function removeDraftOption(prev: QuestionDraft[], id: string, oi: number): QuestionDraft[] {
    return prev.map((q) => (q.draftId === id ? { ...q, options: q.options.filter((_, i) => i !== oi) } : q))
}
function addDraftOption(prev: QuestionDraft[], id: string): QuestionDraft[] {
    return prev.map((q) => (q.draftId === id ? { ...q, options: [...q.options, ''] } : q))
}

// ── Helpers ────────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<QuestionType, string> = {
    OPEN_TEXT: 'Respuesta abierta',
    MULTIPLE_CHOICE: 'Opción múltiple',
    POLL: 'Encuesta',
}
const TYPE_ICONS: Record<QuestionType, typeof FileText> = {
    OPEN_TEXT: FileText,
    MULTIPLE_CHOICE: CheckCircle2,
    POLL: BarChart2,
}

function getPublishLabel(isPending: boolean, isEditing: boolean): string {
    if (isPending) return 'Guardando...'
    return isEditing ? 'Guardar cambios' : 'Publicar'
}

function QuestionBadge({ type }: { type: QuestionType }) {
    const Icon = TYPE_ICONS[type]
    return (
        <Badge variant="secondary" className="gap-1 text-[10px]">
            <Icon className="h-3 w-3" />
            {TYPE_LABELS[type]}
        </Badge>
    )
}

// ── Main component ─────────────────────────────────────────────────────────

export default function CourseDetailPage() {
    const { id } = useParams<{ id: string }>()
    const courseId = Number(id)
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    const [taskDialogOpen, setTaskDialogOpen] = useState(false)
    const [editingPost, setEditingPost] = useState<Post | null>(null)
    const [questionDialogOpen, setQuestionDialogOpen] = useState(false)
    const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
    const [activePostId, setActivePostId] = useState<number | null>(null)
    const [expandedPostId, setExpandedPostId] = useState<number | null>(null)
    const [submissionsPostId, setSubmissionsPostId] = useState<number | null>(null)
    const [inlineQuestions, setInlineQuestions] = useState<QuestionDraft[]>([])

    // ── Queries ──────────────────────────────────────────────────────────────

    const { data: course, isLoading } = useQuery({
        queryKey: ['admin-course-detail', courseId],
        queryFn: () => courseAdminService.findOne(courseId),
        enabled: !Number.isNaN(courseId),
    })

    const { data: enrollments = [] } = useQuery({
        queryKey: ['admin-course-enrollments', courseId],
        queryFn: () => courseAdminService.findEnrollments(courseId),
        enabled: !Number.isNaN(courseId),
    })

    const { data: postDetail } = useQuery({
        queryKey: ['admin-post-detail-course', expandedPostId],
        queryFn: () => courseAdminService.findPostWithQuestions(expandedPostId!),
        enabled: !!expandedPostId,
    })

    const { data: submissions = [] } = useQuery({
        queryKey: ['admin-submissions-course', submissionsPostId],
        queryFn: () => courseAdminService.getSubmissions(submissionsPostId!),
        enabled: !!submissionsPostId,
    })

    const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin-course-detail', courseId] })
    const invalidateDetail = () => queryClient.invalidateQueries({ queryKey: ['admin-post-detail-course', expandedPostId] })

    // ── Task mutations ───────────────────────────────────────────────────────

    const createMutation = useMutation({
        mutationFn: async (data: PostForm) => {
            const post = await courseAdminService.createPost(courseId, {
                ...data,
                maxScore: data.maxScore === '' ? undefined : Number(data.maxScore),
            })
            const validDrafts = inlineQuestions.filter((q) => q.text.trim())
            for (const [idx, draft] of validDrafts.entries()) {
                await courseAdminService.createQuestion(post.id, {
                    text: draft.text,
                    type: draft.type,
                    options: draft.type !== 'OPEN_TEXT' ? draft.options.filter(Boolean) : null,
                    correctOptionIndex: draft.type === 'MULTIPLE_CHOICE' ? draft.correctOptionIndex : null,
                    points: draft.points ?? undefined,
                    order: idx,
                })
            }
            return post
        },
        onSuccess: () => { invalidate(); toast.success('Publicación creada'); closeTaskDialog() },
        onError: () => toast.error('Error al crear la publicación'),
    })

    const updateMutation = useMutation({
        mutationFn: ({ postId, data }: { postId: number; data: PostForm }) =>
            courseAdminService.updatePost(postId, {
                ...data,
                maxScore: data.maxScore === '' ? undefined : Number(data.maxScore),
            }),
        onSuccess: () => { invalidate(); toast.success('Publicación actualizada'); closeTaskDialog() },
        onError: () => toast.error('Error al actualizar'),
    })

    const removeMutation = useMutation({
        mutationFn: (postId: number) => courseAdminService.removePost(courseId, postId),
        onSuccess: () => { invalidate(); toast.success('Publicación eliminada') },
        onError: () => toast.error('Error al eliminar'),
    })

    // ── Question mutations ───────────────────────────────────────────────────

    const createQuestionMutation = useMutation({
        mutationFn: ({ postId, data }: { postId: number; data: QuestionForm }) =>
            courseAdminService.createQuestion(postId, {
                text: data.text,
                type: data.type,
                options: data.type !== 'OPEN_TEXT' ? (data.options ?? []).map((o) => o.value).filter(Boolean) : null,
                correctOptionIndex: data.type === 'MULTIPLE_CHOICE' ? (data.correctOptionIndex ?? null) : null,
                points: data.points === '' ? undefined : Number(data.points || 0) || undefined,
                order: 0,
            }),
        onSuccess: () => { invalidateDetail(); toast.success('Pregunta añadida'); closeQuestionDialog() },
        onError: () => toast.error('Error al añadir pregunta'),
    })

    const updateQuestionMutation = useMutation({
        mutationFn: ({ questionId, data }: { questionId: number; data: QuestionForm }) =>
            courseAdminService.updateQuestion(questionId, {
                text: data.text,
                type: data.type,
                options: data.type !== 'OPEN_TEXT' ? (data.options ?? []).map((o) => o.value).filter(Boolean) : null,
                correctOptionIndex: data.type === 'MULTIPLE_CHOICE' ? (data.correctOptionIndex ?? null) : null,
                points: data.points === '' ? undefined : Number(data.points || 0) || undefined,
                order: editingQuestion?.order ?? 0,
            }),
        onSuccess: () => { invalidateDetail(); toast.success('Pregunta actualizada'); closeQuestionDialog() },
        onError: () => toast.error('Error al actualizar pregunta'),
    })

    const removeQuestionMutation = useMutation({
        mutationFn: (questionId: number) => courseAdminService.removeQuestion(questionId),
        onSuccess: () => { invalidateDetail(); toast.success('Pregunta eliminada') },
        onError: () => toast.error('Error al eliminar pregunta'),
    })

    const gradeMutation = useMutation({
        mutationFn: ({ submissionId, score, teacherComment }: { submissionId: number; score: number; teacherComment?: string }) =>
            courseAdminService.gradeSubmission(submissionId, { score, teacherComment }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-submissions-course', submissionsPostId] })
            toast.success('Calificación guardada')
        },
        onError: () => toast.error('Error al calificar'),
    })

    // ── Task form ────────────────────────────────────────────────────────────

    const { control, register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<PostForm>({
        resolver: zodResolver(postSchema),
    })
    const imageUrl = watch('imageUrl')

    function openCreate() {
        setEditingPost(null)
        reset({ title: '', content: '', imageUrl: '', dueDate: '', maxScore: '' })
        setInlineQuestions([])
        setTaskDialogOpen(true)
    }

    function openEdit(post: Post) {
        setEditingPost(post)
        reset({
            title: post.title,
            content: post.content,
            imageUrl: post.imageUrl ?? '',
            dueDate: post.dueDate ?? '',
            maxScore: post.maxScore ?? '',
        })
        setInlineQuestions([])
        setTaskDialogOpen(true)
    }

    function closeTaskDialog() {
        setTaskDialogOpen(false)
        setEditingPost(null)
        setInlineQuestions([])
    }

    function onSubmit(data: PostForm) {
        if (editingPost) {
            updateMutation.mutate({ postId: editingPost.id, data })
        } else {
            createMutation.mutate(data)
        }
    }

    // ── Question form ────────────────────────────────────────────────────────

    const { control: qControl, register: qRegister, handleSubmit: handleQSubmit,
        reset: resetQ, setValue: setQValue, watch: watchQ,
        formState: { errors: qErrors } } = useForm<QuestionForm>({
        resolver: zodResolver(questionSchema),
        defaultValues: { type: 'OPEN_TEXT', options: [{ value: '' }, { value: '' }] },
    })

    const { fields: optionFields, append: appendOption, remove: removeOption } = useFieldArray({
        control: qControl,
        name: 'options',
    })

    const qType = watchQ('type')
    const qCorrect = watchQ('correctOptionIndex')

    function openAddQuestion(postId: number) {
        setActivePostId(postId)
        setEditingQuestion(null)
        resetQ({ text: '', type: 'OPEN_TEXT', options: [{ value: '' }, { value: '' }], correctOptionIndex: null, points: '' })
        setQuestionDialogOpen(true)
    }

    function openEditQuestion(postId: number, q: Question) {
        setActivePostId(postId)
        setEditingQuestion(q)
        resetQ({
            text: q.text,
            type: q.type,
            options: q.options?.map((v) => ({ value: v })) ?? [{ value: '' }, { value: '' }],
            correctOptionIndex: q.correctOptionIndex,
            points: q.points ?? '',
        })
        setQuestionDialogOpen(true)
    }

    function closeQuestionDialog() {
        setQuestionDialogOpen(false)
        setEditingQuestion(null)
        setActivePostId(null)
    }

    function onSubmitQuestion(data: QuestionForm) {
        if (!activePostId) return
        if (editingQuestion) {
            updateQuestionMutation.mutate({ questionId: editingQuestion.id, data })
        } else {
            createQuestionMutation.mutate({ postId: activePostId, data })
        }
    }

    // ── Grade row ────────────────────────────────────────────────────────────

    function GradeRow({ sub, maxScore }: { sub: TaskSubmission; maxScore: number | null }) {
        const [score, setScore] = useState(sub.score?.toString() ?? '')
        const [comment, setComment] = useState(sub.teacherComment ?? '')
        const studentName = sub.student ? `${sub.student.firstName} ${sub.student.lastName}` : `Estudiante #${sub.studentId}`
        return (
            <div className="border rounded-lg p-3 space-y-2 bg-card">
                <div className="flex items-center justify-between gap-2">
                    <div>
                        <p className="text-sm font-medium">{studentName}</p>
                        <p className="text-xs text-muted-foreground">
                            Enviado: {format(new Date(sub.submittedAt), "d MMM yyyy HH:mm", { locale: es })}
                        </p>
                    </div>
                    {sub.score !== null && (
                        <Badge variant="success" className="text-xs">{sub.score}/{maxScore ?? 20} pts</Badge>
                    )}
                </div>
                {sub.answers.length > 0 && (
                    <div className="space-y-1.5 pl-2 border-l-2 border-muted">
                        {sub.answers.map((ans) => (
                            <div key={ans.id}>
                                <p className="text-[11px] font-medium text-muted-foreground">{ans.question?.text}</p>
                                <p className="text-xs">{ans.textAnswer ?? (ans.selectedOption !== null ? `Opción ${ans.selectedOption + 1}` : '—')}</p>
                            </div>
                        ))}
                    </div>
                )}
                <div className="flex gap-2 items-end pt-1">
                    <div className="space-y-1 flex-1">
                        <Label className="text-xs">Nota (0-{maxScore ?? 20})</Label>
                        <Input type="number" min={0} max={maxScore ?? 20} step={0.5} value={score} onChange={(e) => setScore(e.target.value)} className="h-7 text-xs" />
                    </div>
                    <div className="space-y-1 flex-[2]">
                        <Label className="text-xs">Comentario (opcional)</Label>
                        <Input value={comment} onChange={(e) => setComment(e.target.value)} className="h-7 text-xs" placeholder="Retroalimentación..." />
                    </div>
                    <Button size="sm" className="h-7 text-xs" disabled={gradeMutation.isPending || score === ''} onClick={() => gradeMutation.mutate({ submissionId: sub.id, score: Number(score), teacherComment: comment || undefined })}>
                        Guardar
                    </Button>
                </div>
            </div>
        )
    }

    // ── Render ───────────────────────────────────────────────────────────────

    const isMutating = createMutation.isPending || updateMutation.isPending
    const posts: Post[] = course?.posts ?? []

    if (isLoading) {
        return (
            <section className="p-4 lg:p-6 space-y-4">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-32 w-full rounded-xl" />
                {SKELETON_IDS.map((sid) => <Skeleton key={sid} className="h-28 w-full rounded-xl" />)}
            </section>
        )
    }

    if (!course) {
        return <section className="p-4 lg:p-6"><p className="text-muted-foreground">Curso no encontrado.</p></section>
    }

    return (
        <section className="p-4 lg:p-6 space-y-6">
            {/* Header */}
            <div className="flex items-start gap-3">
                <Button variant="ghost" size="icon" className="h-8 w-8 mt-0.5" onClick={() => navigate('/courses')}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h1 className="text-xl font-bold truncate">{course.title}</h1>
                        <Badge variant={course.isActive ? 'default' : 'secondary'}>
                            {course.isActive ? 'Activo' : 'Inactivo'}
                        </Badge>
                    </div>
                    {course.description && <p className="text-sm text-muted-foreground mt-0.5">{course.description}</p>}
                    <p className="text-xs text-muted-foreground mt-1">Docente: <span className="font-medium">{course.teacher?.name}</span></p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
                {[
                    { label: 'Publicaciones', value: posts.length },
                    { label: 'Estudiantes', value: enrollments.length },
                    { label: 'Creado', value: format(new Date(course.createdAt), "d MMM", { locale: es }) },
                ].map((s) => (
                    <div key={s.label} className="border rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-primary">{s.value}</p>
                        <p className="text-xs text-muted-foreground">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Enrolled students */}
            {enrollments.length > 0 && (
                <div className="space-y-2">
                    <h2 className="text-sm font-semibold flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" />
                        Estudiantes inscritos ({enrollments.length})
                    </h2>
                    <div className="flex flex-wrap gap-2">
                        {enrollments.map((e) => (
                            <Badge key={e.id} variant="outline" className="text-xs">
                                {e.student?.firstName} {e.student?.lastName}
                            </Badge>
                        ))}
                    </div>
                </div>
            )}

            <Separator />

            {/* Posts */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-base font-semibold flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        Publicaciones / Tareas ({posts.length})
                    </h2>
                    <Button size="sm" className="gap-1.5" onClick={openCreate}>
                        <Plus className="h-3.5 w-3.5" /> Nueva publicación
                    </Button>
                </div>

                {posts.length === 0 ? (
                    <div className="text-center text-muted-foreground py-16 border rounded-xl border-dashed">
                        <FileText className="h-8 w-8 mx-auto mb-2 opacity-30" />
                        <p className="text-sm font-medium">Sin publicaciones</p>
                        <Button size="sm" className="mt-4 gap-1.5" onClick={openCreate}><Plus className="h-3.5 w-3.5" /> Nueva publicación</Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {posts.map((post) => {
                            const isExpanded = expandedPostId === post.id
                            const showSubmissions = submissionsPostId === post.id
                            const questions = isExpanded ? (postDetail?.questions ?? []) : []
                            return (
                                <div key={post.id} className="border rounded-xl overflow-hidden bg-card">
                                    {post.imageUrl && (
                                        <div className="h-40 overflow-hidden">
                                            <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                    <div className="p-4 space-y-2">
                                        <div className="flex items-start justify-between gap-2">
                                            <h3 className="font-semibold text-sm">{post.title}</h3>
                                            <div className="flex gap-1 flex-shrink-0">
                                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(post)}><Pencil className="h-3.5 w-3.5" /></Button>
                                                <WarningDialog description={`¿Eliminar "${post.title}"?`} onSubmit={() => removeMutation.mutate(post.id)}>
                                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                                                </WarningDialog>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5">
                                            {post.dueDate && (
                                                <Badge variant="outline" className="gap-1 text-xs">
                                                    <Clock className="h-3 w-3" />
                                                    Entrega: {format(new Date(post.dueDate + 'T00:00:00'), "d MMM yyyy", { locale: es })}
                                                </Badge>
                                            )}
                                            {post.maxScore != null && (
                                                <Badge variant="outline" className="gap-1 text-xs">
                                                    <Star className="h-3 w-3" /> Nota máx: {post.maxScore} pts
                                                </Badge>
                                            )}
                                            {post.imageUrl && (
                                                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Image className="h-3 w-3" /> Imagen</span>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{post.content}</p>
                                        <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                                            <span className="text-xs text-muted-foreground">{format(new Date(post.createdAt), "d 'de' MMMM yyyy, HH:mm", { locale: es })}</span>
                                            <div className="ml-auto flex gap-1.5">
                                                <Button variant="outline" size="sm" className="h-6 text-xs gap-1" onClick={() => setSubmissionsPostId(showSubmissions ? null : post.id)}>
                                                    <ListChecks className="h-3 w-3" />
                                                    {showSubmissions ? 'Ocultar entregas' : 'Ver entregas'}
                                                </Button>
                                                <Button variant="outline" size="sm" className="h-6 text-xs gap-1" onClick={() => { setExpandedPostId(isExpanded ? null : post.id); if (!isExpanded) setSubmissionsPostId(null) }}>
                                                    <ListChecks className="h-3 w-3" />
                                                    {isExpanded ? 'Ocultar preguntas' : 'Gestionar preguntas'}
                                                    {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Questions panel */}
                                    {isExpanded && (
                                        <div className="border-t bg-muted/30 p-4 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <h4 className="text-xs font-semibold flex items-center gap-1.5">
                                                    <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                                                    Preguntas ({questions.length})
                                                </h4>
                                                <Button size="sm" variant="outline" className="h-6 text-xs gap-1" onClick={() => openAddQuestion(post.id)}>
                                                    <Plus className="h-3 w-3" /> Añadir
                                                </Button>
                                            </div>
                                            {questions.length === 0 ? (
                                                <p className="text-xs text-muted-foreground text-center py-4 border border-dashed rounded-lg">Sin preguntas.</p>
                                            ) : (
                                                <div className="space-y-2">
                                                    {questions.map((q, idx) => (
                                                        <div key={q.id} className="bg-white rounded-lg border p-3 space-y-1.5">
                                                            <div className="flex items-start justify-between gap-2">
                                                                <p className="text-xs font-medium flex-1 min-w-0">
                                                                    <span className="text-muted-foreground mr-1">{idx + 1}.</span>{q.text}
                                                                </p>
                                                                <div className="flex gap-1 flex-shrink-0">
                                                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => openEditQuestion(post.id, q)}><Pencil className="h-3 w-3" /></Button>
                                                                    <WarningDialog description={`¿Eliminar la pregunta "${q.text}"?`} onSubmit={() => removeQuestionMutation.mutate(q.id)}>
                                                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive"><Trash2 className="h-3 w-3" /></Button>
                                                                    </WarningDialog>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <QuestionBadge type={q.type} />
                                                                {q.points != null && (
                                                                    <Badge variant="outline" className="text-[10px] gap-1">
                                                                        <Star className="h-2.5 w-2.5" />{q.points} pts
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            {q.options && q.options.length > 0 && (
                                                                <ul className="space-y-0.5 pl-2">
                                                                    {q.options.map((opt, oi) => (
                                                                        <li key={`${q.id}-${oi}`} className={cn('text-[11px] flex items-center gap-1', oi === q.correctOptionIndex && 'text-green-700 font-medium')}>
                                                                            {oi === q.correctOptionIndex && <CheckCircle2 className="h-3 w-3 text-green-600" />}
                                                                            {oi !== q.correctOptionIndex && <span className="w-3" />}
                                                                            {opt}
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Submissions panel */}
                                    {showSubmissions && (
                                        <div className="border-t bg-muted/20 p-4 space-y-3">
                                            <h4 className="text-xs font-semibold flex items-center gap-1.5">
                                                <ListChecks className="h-3.5 w-3.5 text-primary" />
                                                Entregas ({submissions.length})
                                            </h4>
                                            {submissions.length === 0 ? (
                                                <p className="text-xs text-muted-foreground text-center py-4 border border-dashed rounded-lg">Ningún estudiante ha entregado todavía.</p>
                                            ) : (
                                                <div className="space-y-2">
                                                    {submissions.map((sub) => (
                                                        <GradeRow key={sub.id} sub={sub} maxScore={post.maxScore ?? null} />
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* ── Task Dialog ──────────────────────────────────────────────── */}
            <Dialog open={taskDialogOpen} onOpenChange={(v) => { if (!v) closeTaskDialog(); else setTaskDialogOpen(v) }}>
                <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            {editingPost ? 'Editar publicación' : 'Nueva publicación'}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
                        <div className="space-y-1.5">
                            <Label>Título *</Label>
                            <Input {...register('title')} placeholder="Ej: Tarea 1 - Normas de tránsito" />
                            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <Label>Contenido / Instrucciones *</Label>
                            <Textarea {...register('content')} placeholder="Escribe el mensaje, instrucciones o tarea..." rows={4} />
                            {errors.content && <p className="text-xs text-destructive">{errors.content.message}</p>}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Fecha límite</Label>
                                <Input type="date" {...register('dueDate')} />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="flex items-center gap-1"><Star className="h-3.5 w-3.5" /> Nota máxima (0–20)</Label>
                                <Input type="number" min={0} max={20} step={0.5} {...register('maxScore')} placeholder="ej: 20" />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label>Imagen adjunta (opcional)</Label>
                            <Controller
                                control={control}
                                name="imageUrl"
                                render={() => (
                                    <ImageUpload value={imageUrl || undefined} onChange={(url) => setValue('imageUrl', url ?? '')} />
                                )}
                            />
                        </div>

                        {/* Inline question builder (create only) */}
                        {editingPost === null && (
                            <div className="space-y-3">
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-semibold flex items-center gap-1.5">
                                        <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                                        Preguntas
                                        {inlineQuestions.length > 0 && <Badge variant="secondary" className="text-[10px] ml-1 px-1.5">{inlineQuestions.length}</Badge>}
                                    </p>
                                    <Button type="button" variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => setInlineQuestions((prev) => [...prev, newDraft()])}>
                                        <Plus className="h-3 w-3" /> Añadir pregunta
                                    </Button>
                                </div>
                                {inlineQuestions.length === 0 && (
                                    <p className="text-xs text-center text-muted-foreground py-3 border border-dashed rounded-lg">
                                        Opcional — añade preguntas con puntaje individual.
                                    </p>
                                )}
                                {inlineQuestions.map((draft, idx) => (
                                    <div key={draft.draftId} className="border rounded-lg p-3 space-y-2 bg-muted/20">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-primary/80 w-5 flex-shrink-0">{idx + 1}.</span>
                                            <Select value={draft.type} onValueChange={(v) => setInlineQuestions((prev) => patchDraft(prev, draft.draftId, { type: v as QuestionType, correctOptionIndex: null }))}>
                                                <SelectTrigger className="h-7 text-xs flex-1"><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="OPEN_TEXT">Respuesta abierta</SelectItem>
                                                    <SelectItem value="MULTIPLE_CHOICE">Opción múltiple</SelectItem>
                                                    <SelectItem value="POLL">Encuesta</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <Input
                                                type="number"
                                                min={0}
                                                step={0.5}
                                                value={draft.points?.toString() ?? ''}
                                                onChange={(e) => setInlineQuestions((prev) => patchDraft(prev, draft.draftId, { points: e.target.value ? Number(e.target.value) : null }))}
                                                placeholder="pts"
                                                className="w-16 h-7 text-xs flex-shrink-0"
                                            />
                                            <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-destructive flex-shrink-0" onClick={() => setInlineQuestions((prev) => prev.filter((q) => q.draftId !== draft.draftId))}>
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                        <Input value={draft.text} onChange={(e) => setInlineQuestions((prev) => patchDraft(prev, draft.draftId, { text: e.target.value }))} placeholder="Enunciado de la pregunta..." className="h-8 text-sm" />
                                        {(draft.type === 'MULTIPLE_CHOICE' || draft.type === 'POLL') && (
                                            <div className="space-y-1.5 pl-5">
                                                {draft.options.map((opt, oi) => (
                                                    <div key={`${draft.draftId}-o${oi}`} className="flex items-center gap-1.5">
                                                        {draft.type === 'MULTIPLE_CHOICE' ? (
                                                            <button type="button" title="Marcar como correcta" onClick={() => setInlineQuestions((prev) => patchDraft(prev, draft.draftId, { correctOptionIndex: oi }))}
                                                                className={cn('w-4 h-4 rounded-full border-2 flex-shrink-0 transition-colors', draft.correctOptionIndex === oi ? 'bg-green-500 border-green-500' : 'border-muted-foreground hover:border-green-400')} />
                                                        ) : (
                                                            <span className="w-4 h-4 rounded-full bg-muted border text-[10px] flex items-center justify-center flex-shrink-0 font-medium">{oi + 1}</span>
                                                        )}
                                                        <Input value={opt} onChange={(e) => setInlineQuestions((prev) => patchDraftOption(prev, draft.draftId, oi, e.target.value))} placeholder={`Opción ${oi + 1}`} className="h-7 text-xs flex-1" />
                                                        {draft.options.length > 2 && (
                                                            <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-destructive flex-shrink-0" onClick={() => setInlineQuestions((prev) => removeDraftOption(prev, draft.draftId, oi))}>
                                                                <Trash2 className="h-3 w-3" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                ))}
                                                {draft.type === 'MULTIPLE_CHOICE' && <p className="text-[10px] text-muted-foreground">Círculo verde = respuesta correcta.</p>}
                                                <Button type="button" variant="outline" size="sm" className="h-6 text-[11px] gap-1 mt-0.5" onClick={() => setInlineQuestions((prev) => addDraftOption(prev, draft.draftId))}>
                                                    <Plus className="h-3 w-3" /> Opción
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={closeTaskDialog}>Cancelar</Button>
                            <Button type="submit" disabled={isMutating}>
                                {getPublishLabel(isMutating, editingPost !== null)}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* ── Question Dialog ──────────────────────────────────────────── */}
            <Dialog open={questionDialogOpen} onOpenChange={(v) => { if (!v) closeQuestionDialog(); else setQuestionDialogOpen(v) }}>
                <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4" />
                            {editingQuestion ? 'Editar pregunta' : 'Nueva pregunta'}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleQSubmit(onSubmitQuestion)} className="space-y-4 py-2">
                        <div className="space-y-1.5">
                            <Label>Enunciado *</Label>
                            <Textarea {...qRegister('text')} placeholder="Escribe la pregunta..." rows={2} />
                            {qErrors.text && <p className="text-xs text-destructive">{qErrors.text.message}</p>}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label>Tipo</Label>
                                <Controller control={qControl} name="type" render={({ field }) => (
                                    <Select value={field.value} onValueChange={(v) => { field.onChange(v); setQValue('correctOptionIndex', null) }}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="OPEN_TEXT">Respuesta abierta</SelectItem>
                                            <SelectItem value="MULTIPLE_CHOICE">Opción múltiple</SelectItem>
                                            <SelectItem value="POLL">Encuesta</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )} />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="flex items-center gap-1"><Star className="h-3 w-3" /> Puntos (opcional)</Label>
                                <Input type="number" min={0} step={0.5} {...qRegister('points')} placeholder="ej: 5" />
                            </div>
                        </div>
                        {(qType === 'MULTIPLE_CHOICE' || qType === 'POLL') && (
                            <div className="space-y-2">
                                <Label>Opciones</Label>
                                {optionFields.map((field, idx) => (
                                    <div key={field.id} className="flex items-center gap-2">
                                        {qType === 'MULTIPLE_CHOICE' && (
                                            <button type="button" onClick={() => setQValue('correctOptionIndex', idx)} title="Respuesta correcta"
                                                className={cn('w-4 h-4 rounded-full border-2 flex-shrink-0 transition-colors', Number(qCorrect) === idx ? 'bg-green-500 border-green-500' : 'border-muted-foreground')} />
                                        )}
                                        {qType === 'POLL' && <span className="w-4 h-4 flex-shrink-0 rounded-full bg-muted border text-[10px] flex items-center justify-center font-medium">{idx + 1}</span>}
                                        <Input {...qRegister(`options.${idx}.value`)} placeholder={`Opción ${idx + 1}`} className="flex-1 h-8 text-sm" />
                                        {optionFields.length > 2 && (
                                            <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeOption(idx)}><Trash2 className="h-3 w-3" /></Button>
                                        )}
                                    </div>
                                ))}
                                {qType === 'MULTIPLE_CHOICE' && <p className="text-[11px] text-muted-foreground">Haz clic en el círculo para marcar la correcta.</p>}
                                <Button type="button" variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => appendOption({ value: '' })}>
                                    <Plus className="h-3 w-3" /> Opción
                                </Button>
                            </div>
                        )}
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={closeQuestionDialog}>Cancelar</Button>
                            <Button type="submit" disabled={createQuestionMutation.isPending || updateQuestionMutation.isPending}>
                                {editingQuestion ? 'Guardar cambios' : 'Añadir pregunta'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </section>
    )
}
