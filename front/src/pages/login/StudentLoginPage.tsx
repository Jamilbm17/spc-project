import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, GraduationCap, UserPlus, LogIn } from 'lucide-react'
import { studentAuthService, type StudentRegisterDto } from '@/services/student-auth.service'
import { getHttpErrorMessage } from '@/lib/error'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'
import { PATHS } from '@/router/paths'

// ─── Login Schema ───────────────────────────────────────────────────────────────
const loginSchema = z.object({
    email: z.string().email('Correo electrónico inválido'),
    password: z.string().min(6, 'Mínimo 6 caracteres'),
})

// ─── Register Schema ────────────────────────────────────────────────────────────
const registerSchema = z
    .object({
        firstName: z.string().min(2, 'Requerido'),
        lastName: z.string().min(2, 'Requerido'),
        email: z.string().email('Correo electrónico inválido'),
        password: z.string().min(6, 'Mínimo 6 caracteres'),
        confirmPassword: z.string(),
        dni: z.string().min(6, 'DNI inválido').optional(),
        institutionName: z.string().min(2, 'Requerido'),
        phone: z.string().optional(),
        grade: z.string().optional(),
    })
    .refine((d) => d.password === d.confirmPassword, {
        message: 'Las contraseñas no coinciden',
        path: ['confirmPassword'],
    })

type LoginValues = z.infer<typeof loginSchema>
type RegisterValues = z.infer<typeof registerSchema>

export default function StudentLoginPage() {
    const [tab, setTab] = useState<'login' | 'register'>('login')
    const [showPwd, setShowPwd] = useState(false)
    const [isPending, setIsPending] = useState(false)
    const navigate = useNavigate()

    // ── Login Form ──
    const loginForm = useForm<LoginValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: '', password: '' },
    })

    // ── Register Form ──
    const registerForm = useForm<RegisterValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            confirmPassword: '',
            dni: '',
            institutionName: '',
            phone: '',
            grade: '',
        },
    })

    const onLogin = async (values: LoginValues) => {
        setIsPending(true)
        try {
            const result = await studentAuthService.signIn({ email: values.email, password: values.password })
            localStorage.setItem('spc_student_token', result.accessToken)
            toast.success('¡Bienvenido!')
            navigate(PATHS.STUDENT.DASHBOARD, { replace: true })
        } catch (err) {
            toast.error('Error al iniciar sesión', { description: getHttpErrorMessage(err) })
        } finally {
            setIsPending(false)
        }
    }

    const onRegister = async (values: RegisterValues) => {
        setIsPending(true)
        try {
            const dto: StudentRegisterDto = {
                firstName: values.firstName,
                lastName: values.lastName,
                email: values.email,
                password: values.password,
                dni: values.dni,
                institutionName: values.institutionName,
                phone: values.phone || undefined,
                grade: values.grade || undefined,
            }
            const result = await studentAuthService.register(dto)
            localStorage.setItem('spc_student_token', result.accessToken)
            toast.success('¡Cuenta creada! Bienvenido.')
            navigate(PATHS.STUDENT.DASHBOARD, { replace: true })
        } catch (err) {
            toast.error('Error al registrarse', { description: getHttpErrorMessage(err) })
        } finally {
            setIsPending(false)
        }
    }

    return (
        <div className="w-full max-w-sm lg:max-w-md mx-auto p-6 space-y-6 bg-white rounded-xl shadow-md">
            {/* Header */}
            <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <GraduationCap className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Portal Estudiantil</h3>
                <p className="text-sm text-muted-foreground">Sistema de Prevención Comunitaria</p>
            </div>

            {/* Tabs */}
            <div className="flex rounded-lg bg-muted p-1 gap-1">
                <button
                    onClick={() => setTab('login')}
                    className={`flex-1 flex items-center justify-center gap-2 text-sm font-medium py-2 rounded-md transition-colors ${tab === 'login' ? 'bg-white shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                >
                    <LogIn className="h-4 w-4" />
                    Iniciar sesión
                </button>
                <button
                    onClick={() => setTab('register')}
                    className={`flex-1 flex items-center justify-center gap-2 text-sm font-medium py-2 rounded-md transition-colors ${tab === 'register' ? 'bg-white shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                >
                    <UserPlus className="h-4 w-4" />
                    Crear cuenta
                </button>
            </div>

            {/* Login Form */}
            {tab === 'login' && (
                <form onSubmit={loginForm.handleSubmit(onLogin)} className="grid gap-4">
                    <div className="grid gap-1.5">
                        <Label htmlFor="login-email">Correo electrónico</Label>
                        <Input id="login-email" type="email" placeholder="tu@correo.com" {...loginForm.register('email')} />
                        {loginForm.formState.errors.email && (
                            <p className="text-xs text-destructive">{loginForm.formState.errors.email.message}</p>
                        )}
                    </div>
                    <div className="grid gap-1.5">
                        <Label htmlFor="login-pwd">Contraseña</Label>
                        <div className="relative">
                            <Input
                                id="login-pwd"
                                type={showPwd ? 'text' : 'password'}
                                {...loginForm.register('password')}
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                                onClick={() => setShowPwd(!showPwd)}
                            >
                                {showPwd ? <EyeOff className="h-4 w-4 text-gray-500" /> : <Eye className="h-4 w-4" />}
                            </Button>
                        </div>
                        {loginForm.formState.errors.password && (
                            <p className="text-xs text-destructive">{loginForm.formState.errors.password.message}</p>
                        )}
                    </div>
                    <Button type="submit" disabled={isPending} className="mt-1">
                        {isPending && <Spinner className="h-4 w-4" />}
                        Ingresar
                    </Button>
                </form>
            )}

            {/* Register Form */}
            {tab === 'register' && (
                <form onSubmit={registerForm.handleSubmit(onRegister)} className="grid gap-3">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="grid gap-1.5">
                            <Label htmlFor="reg-firstname">Nombres *</Label>
                            <Input id="reg-firstname" placeholder="Juan" {...registerForm.register('firstName')} />
                            {registerForm.formState.errors.firstName && (
                                <p className="text-xs text-destructive">{registerForm.formState.errors.firstName.message}</p>
                            )}
                        </div>
                        <div className="grid gap-1.5">
                            <Label htmlFor="reg-lastname">Apellidos *</Label>
                            <Input id="reg-lastname" placeholder="Pérez" {...registerForm.register('lastName')} />
                            {registerForm.formState.errors.lastName && (
                                <p className="text-xs text-destructive">{registerForm.formState.errors.lastName.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid gap-1.5">
                        <Label htmlFor="reg-email">Correo electrónico *</Label>
                        <Input id="reg-email" type="email" placeholder="tu@correo.com" {...registerForm.register('email')} />
                        {registerForm.formState.errors.email && (
                            <p className="text-xs text-destructive">{registerForm.formState.errors.email.message}</p>
                        )}
                    </div>

                    <div className="grid gap-1.5">
                        <Label htmlFor="reg-dni">DNI / Documento de identidad *</Label>
                        <Input id="reg-dni" placeholder="12345678" {...registerForm.register('dni')} />
                        {registerForm.formState.errors.dni && (
                            <p className="text-xs text-destructive">{registerForm.formState.errors.dni.message}</p>
                        )}
                    </div>

                    <div className="grid gap-1.5">
                        <Label htmlFor="reg-institution">Institución educativa *</Label>
                        <Input id="reg-institution" placeholder="Colegio Nacional..." {...registerForm.register('institutionName')} />
                        {registerForm.formState.errors.institutionName && (
                            <p className="text-xs text-destructive">{registerForm.formState.errors.institutionName.message}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="grid gap-1.5">
                            <Label htmlFor="reg-phone">Teléfono (opcional)</Label>
                            <Input id="reg-phone" placeholder="999 999 999" {...registerForm.register('phone')} />
                        </div>
                        <div className="grid gap-1.5">
                            <Label htmlFor="reg-grade">Grado / Año (opcional)</Label>
                            <Input id="reg-grade" placeholder="5to Sec." {...registerForm.register('grade')} />
                        </div>
                    </div>

                    <div className="grid gap-1.5">
                        <Label htmlFor="reg-pwd">Contraseña *</Label>
                        <Input id="reg-pwd" type="password" placeholder="Mínimo 6 caracteres" {...registerForm.register('password')} />
                        {registerForm.formState.errors.password && (
                            <p className="text-xs text-destructive">{registerForm.formState.errors.password.message}</p>
                        )}
                    </div>

                    <div className="grid gap-1.5">
                        <Label htmlFor="reg-confirm">Confirmar contraseña *</Label>
                        <Input id="reg-confirm" type="password" placeholder="Repite tu contraseña" {...registerForm.register('confirmPassword')} />
                        {registerForm.formState.errors.confirmPassword && (
                            <p className="text-xs text-destructive">{registerForm.formState.errors.confirmPassword.message}</p>
                        )}
                    </div>

                    <Button type="submit" disabled={isPending} className="mt-1">
                        {isPending && <Spinner className="h-4 w-4" />}
                        Crear cuenta
                    </Button>
                </form>
            )}

            {/* Link to admin login */}
            <p className="text-center text-xs text-muted-foreground">
                ¿Eres docente o administrador?{' '}
                <Link to={PATHS.LOGIN_ADMIN} className="text-primary hover:underline font-medium">
                    Ingresa aquí
                </Link>
            </p>
        </div>
    )
}
