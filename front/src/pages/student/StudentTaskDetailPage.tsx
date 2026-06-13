import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
    ArrowLeft, FileText, Clock, Star, CheckCircle2, BarChart2,
    Award, MessageSquare, Image, ArrowUpFromLine,
} from 'lucide-react'
import {
    courseStudentService,
    type Question,
    type TaskSubmission,
} from '@/services/course.service'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

// ── Helpers ────────────────────────────────────────────────────────────────

function dueDateLabel(dueDate: string) {
    const d = new Date(dueDate + 'T00:00:00')
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const diff = Math.ceil((d.getTime() - today.getTime()) / 86400000)
    if (diff < 0) return { label: `Venció hace ${Math.abs(diff)} día${Math.abs(diff) === 1 ? '' : 's'}`, overdue: true }
    if (diff === 0) return { label: 'Vence hoy', overdue: false }
    return { label: `${diff} día${diff === 1 ? '' : 's'} restante${diff === 1 ? '' : 's'}`, overdue: false }
}

// ── Answer inputs ──────────────────────────────────────────────────────────

interface AnswerState {
    questionId: number
    textAnswer: string
    selectedOption: number | null
}

interface ChoiceInputProps {
    readonly options: string[]
    readonly selected: number | null
    readonly onSelect: (i: number) => void
    readonly correctIndex?: number | null
    readonly submitted: boolean
    readonly type: 'MULTIPLE_CHOICE' | 'POLL'
}

function ChoiceInput({ options, selected, onSelect, correctIndex, submitted, type }: ChoiceInputProps) {
    return (
        <div className="space-y-2">
            {options.map((opt, i) => {
                const isSelected = selected === i
                const isCorrect = type === 'MULTIPLE_CHOICE' && submitted && correctIndex === i
                const isWrong = type === 'MULTIPLE_CHOICE' && submitted && isSelected && correctIndex !== i

                return (
                    <button
                        key={opt}
                        type="button"
                        disabled={submitted}
                        onClick={() => onSelect(i)}
                        className={cn(
                            'w-full flex items-center gap-3 rounded-lg border p-3 text-left text-sm transition-colors',
                            !submitted && 'hover:bg-muted/50 cursor-pointer',
                            submitted && 'cursor-default',
                            isSelected && !submitted && 'border-primary bg-primary/5',
                            isCorrect && 'border-green-500 bg-green-50 text-green-800',
                            isWrong && 'border-red-400 bg-red-50 text-red-800',
                            !isSelected && !isCorrect && submitted && 'opacity-60',
                        )}
                    >
                        <span className={cn(
                            'w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors',
                            isSelected && !submitted && 'border-primary bg-primary',
                            isCorrect && 'border-green-500 bg-green-500',
                            isWrong && 'border-red-400 bg-red-400',
                            !isSelected && 'border-muted-foreground',
                        )}>
                            {(isSelected || isCorrect) && <span className="w-2 h-2 rounded-full bg-white" />}
                        </span>
                        <span className="flex-1">{opt}</span>
                        {isCorrect && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                    </button>
                )
            })}
        </div>
    )
}

// ── Main page ──────────────────────────────────────────────────────────────

export default function StudentTaskDetailPage() {
    const { postId } = useParams<{ postId: string }>()
    const postIdNum = Number(postId)
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    const [answers, setAnswers] = useState<AnswerState[]>([])
    const [submitted, setSubmitted] = useState(false)

    const { data: post, isLoading: loadingPost } = useQuery({
        queryKey: ['student-task-detail', postIdNum],
        queryFn: () => courseStudentService.findPostWithQuestions(postIdNum),
        enabled: !Number.isNaN(postIdNum),
    })

    const { data: mySubmission, isLoading: loadingSubmission } = useQuery({
        queryKey: ['student-my-submission', postIdNum],
        queryFn: () => courseStudentService.getMySubmission(postIdNum),
        enabled: !Number.isNaN(postIdNum),
    })

    // Init answers when post + submission load
    useEffect(() => {
        if (!post) return
        const questions = post.questions ?? []
        const sub = mySubmission
        if (sub) {
            setSubmitted(true)
            setAnswers(questions.map((q: Question) => {
                const ans = sub.answers.find((a) => a.questionId === q.id)
                return { questionId: q.id, textAnswer: ans?.textAnswer ?? '', selectedOption: ans?.selectedOption ?? null }
            }))
        } else {
            setSubmitted(false)
            setAnswers(questions.map((q: Question) => ({ questionId: q.id, textAnswer: '', selectedOption: null })))
        }
    }, [post, mySubmission])

    const submitMutation = useMutation({
        mutationFn: () =>
            courseStudentService.submitTask(
                postIdNum,
                answers.map((a) => ({
                    questionId: a.questionId,
                    textAnswer: a.textAnswer || undefined,
                    selectedOption: a.selectedOption ?? undefined,
                })),
            ),
        onSuccess: (data: TaskSubmission) => {
            setSubmitted(true)
            queryClient.setQueryData(['student-my-submission', postIdNum], data)
            toast.success('¡Tarea entregada correctamente!')
        },
        onError: () => toast.error('Error al entregar la tarea'),
    })

    function setAnswer(questionId: number, patch: Partial<AnswerState>) {
        setAnswers((prev) => prev.map((a) => a.questionId === questionId ? { ...a, ...patch } : a))
    }

    if (loadingPost || loadingSubmission) {
        return (
            <section className="p-4 lg:p-6 space-y-6 max-w-2xl mx-auto">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-32 rounded-xl" />
                <Skeleton className="h-48 rounded-xl" />
            </section>
        )
    }

    if (!post) {
        return (
            <section className="p-4 lg:p-6">
                <p className="text-muted-foreground">Tarea no encontrada.</p>
            </section>
        )
    }

    const questions = post.questions ?? []
    const sub = mySubmission
    const dueInfo = post.dueDate ? dueDateLabel(post.dueDate) : null
    const hasQuestions = questions.length > 0

    return (
        <section className="p-4 lg:p-6 max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-start gap-3">
                <Button variant="ghost" size="icon" className="h-8 w-8 mt-0.5" onClick={() => navigate(-1)}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="flex-1 min-w-0">
                    <h1 className="text-xl font-bold leading-tight">{post.title}</h1>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {post.dueDate && dueInfo && (
                            <Badge variant={dueInfo.overdue ? 'destructive' : 'outline'} className="gap-1 text-xs">
                                <Clock className="h-3 w-3" />
                                {format(new Date(post.dueDate + 'T00:00:00'), "d MMM yyyy", { locale: es })}
                                <span className="text-[10px] opacity-75 ml-0.5">({dueInfo.label})</span>
                            </Badge>
                        )}
                        {post.maxScore != null && (
                            <Badge variant="outline" className="gap-1 text-xs">
                                <Star className="h-3 w-3" />
                                {post.maxScore} puntos
                            </Badge>
                        )}
                        {renderSubmissionBadge(submitted, sub, post.maxScore)}
                    </div>
                </div>
            </div>

            {/* Cover image */}
            {post.imageUrl && (
                <div className="rounded-xl overflow-hidden">
                    <img src={post.imageUrl} alt={post.title} className="w-full max-h-64 object-cover" />
                </div>
            )}

            {/* Content */}
            <div className="bg-card border rounded-xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4 text-primary" />
                    <span className="font-medium text-foreground">Instrucciones</span>
                    <span className="ml-auto text-xs">
                        {format(new Date(post.createdAt), "d 'de' MMMM yyyy", { locale: es })}
                    </span>
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>
                {post.imageUrl && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Image className="h-3 w-3" /> Imagen adjunta arriba
                    </div>
                )}
            </div>

            {/* Teacher comment */}
            {submitted && sub?.teacherComment && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-1">
                    <p className="text-xs font-semibold text-blue-700 flex items-center gap-1.5">
                        <MessageSquare className="h-3.5 w-3.5" /> Comentario del docente
                    </p>
                    <p className="text-sm text-blue-900">{sub.teacherComment}</p>
                </div>
            )}

            {/* Questions */}
            {hasQuestions && (
                <>
                    <Separator />
                    <div className="space-y-5">
                        <h2 className="text-base font-semibold flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                            {questions.length} pregunta{questions.length === 1 ? '' : 's'}
                            {submitted && (
                                <Badge variant="secondary" className="ml-auto text-xs">Respondido</Badge>
                            )}
                        </h2>

                        {questions.map((q: Question, idx: number) => {
                            const ans = answers.find((a) => a.questionId === q.id)
                            const submittedAns = sub?.answers?.find((a) => a.questionId === q.id)

                            return (
                                <div key={q.id} className="bg-card border rounded-xl p-4 space-y-3">
                                    <div className="flex items-start gap-2">
                                        <span className="text-xs font-bold text-primary w-6 flex-shrink-0 pt-0.5">
                                            {idx + 1}.
                                        </span>
                                        <div className="flex-1 space-y-1.5">
                                            <p className="text-sm font-medium leading-relaxed">{q.text}</p>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                {q.type === 'OPEN_TEXT' && (
                                                    <Badge variant="secondary" className="text-[10px] gap-1">
                                                        <FileText className="h-3 w-3" /> Respuesta abierta
                                                    </Badge>
                                                )}
                                                {q.type === 'MULTIPLE_CHOICE' && (
                                                    <Badge variant="secondary" className="text-[10px] gap-1">
                                                        <CheckCircle2 className="h-3 w-3" /> Opción múltiple
                                                    </Badge>
                                                )}
                                                {q.type === 'POLL' && (
                                                    <Badge variant="secondary" className="text-[10px] gap-1">
                                                        <BarChart2 className="h-3 w-3" /> Encuesta
                                                    </Badge>
                                                )}
                                                {q.points != null && (
                                                    <Badge variant="outline" className="text-[10px] gap-1 text-primary border-primary/40">
                                                        <Star className="h-2.5 w-2.5" /> {q.points} {q.points === 1 ? 'punto' : 'puntos'}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {q.type === 'OPEN_TEXT' && (
                                        submitted ? (
                                            <div className="bg-muted/40 rounded-lg p-3 text-sm ml-8">
                                                {submittedAns?.textAnswer || <span className="text-muted-foreground italic">Sin respuesta</span>}
                                            </div>
                                        ) : (
                                            <div className="ml-8">
                                                <Textarea
                                                    value={ans?.textAnswer ?? ''}
                                                    onChange={(e) => setAnswer(q.id, { textAnswer: e.target.value })}
                                                    placeholder="Escribe tu respuesta aquí..."
                                                    rows={3}
                                                    className="text-sm"
                                                />
                                            </div>
                                        )
                                    )}

                                    {(q.type === 'MULTIPLE_CHOICE' || q.type === 'POLL') && q.options && (
                                        <div className="ml-8">
                                            <ChoiceInput
                                                options={q.options}
                                                selected={submitted ? (submittedAns?.selectedOption ?? null) : (ans?.selectedOption ?? null)}
                                                onSelect={(i) => setAnswer(q.id, { selectedOption: i })}
                                                correctIndex={q.correctOptionIndex}
                                                submitted={submitted}
                                                type={q.type}
                                            />
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </>
            )}

            {/* Submit / Submitted state */}
            {submitted ? (
                <div className="text-center py-4 space-y-1 border rounded-xl bg-green-50 border-green-200">
                    <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto" />
                    <p className="text-sm font-medium text-green-800">
                        Entregada el {sub?.submittedAt
                            ? format(new Date(sub.submittedAt), "d 'de' MMMM yyyy 'a las' HH:mm", { locale: es })
                            : '—'}
                    </p>
                    <p className="text-xs text-green-600">Puedes revisar tus respuestas arriba.</p>
                </div>
            ) : (
                <div className="sticky bottom-4">
                    {renderSubmitButton(submitMutation.isPending, hasQuestions, () => submitMutation.mutate())}
                </div>
            )}
        </section>
    )
}

function renderSubmitButton(isPending: boolean, hasQuestions: boolean, onSubmit: () => void) {
    const label = hasQuestions ? 'Entregar tarea' : 'Marcar como vista'
    return (
        <Button className="w-full gap-2 shadow-lg" size="lg" disabled={isPending} onClick={onSubmit}>
            <ArrowUpFromLine className="h-4 w-4" />
            {isPending ? 'Enviando...' : label}
        </Button>
    )
}

function renderSubmissionBadge(submitted: boolean, sub: TaskSubmission | null, maxScore: number | null | undefined) {
    if (!submitted) return null
    if (sub?.score !== null && sub?.score !== undefined) {
        const max = maxScore ?? 20
        const pct = Math.round((sub.score / max) * 100)
        const variant = pct >= 60 ? 'success' : 'destructive'
        return (
            <Badge variant={variant as any} className="text-xs gap-1 px-2">
                <Award className="h-3.5 w-3.5" />
                {sub.score} / {max} pts
            </Badge>
        )
    }
    return (
        <Badge variant="secondary" className="text-xs gap-1">
            <CheckCircle2 className="h-3 w-3" /> Entregada
        </Badge>
    )
}
