import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, ShieldCheck, UserPlus, LogIn } from 'lucide-react'
import { useAuth } from '@/providers/AuthProvider'
import { authService, type RegisterAdminDto } from '@/services/auth.service'
import { getHttpErrorMessage } from '@/lib/error'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
        name: z.string().min(2, 'Requerido'),
        email: z.string().email('Correo electrónico inválido'),
        password: z.string().min(6, 'Mínimo 6 caracteres'),
        confirmPassword: z.string(),
        phone: z.string().optional(),
        role: z.enum(['ADMIN', 'TEACHER']),
    })
    .refine((d) => d.password === d.confirmPassword, {
        message: 'Las contraseñas no coinciden',
        path: ['confirmPassword'],
    })

type LoginValues = z.infer<typeof loginSchema>
type RegisterValues = z.infer<typeof registerSchema>

export default function AdminLoginPage() {
    const [tab, setTab] = useState<'login' | 'register'>('login')
    const [showPwd, setShowPwd] = useState(false)
    const [isPending, setIsPending] = useState(false)
    const { signIn } = useAuth()

    // ── Login Form ──
    const loginForm = useForm<LoginValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: '', password: '' },
    })

    // ── Register Form ──
    const registerForm = useForm<RegisterValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: { name: '', email: '', password: '', confirmPassword: '', phone: '', role: 'TEACHER' },
    })

    const onLogin = async (values: LoginValues) => {
        setIsPending(true)
        try {
            await signIn(values.email, values.password)
            toast.success('Sesión iniciada correctamente')
        } catch (err) {
            toast.error('Error al iniciar sesión', { description: getHttpErrorMessage(err) })
        } finally {
            setIsPending(false)
        }
    }

    const onRegister = async (values: RegisterValues) => {
        setIsPending(true)
        try {
            const dto: RegisterAdminDto = {
                name: values.name,
                email: values.email,
                password: values.password,
                phone: values.phone || undefined,
                role: values.role,
            }
            const result = await authService.register(dto)
            localStorage.setItem('spc_token', result.accessToken)
            toast.success('¡Cuenta creada! Bienvenido.')
            await signIn(values.email, values.password)
        } catch (err) {
            toast.error('Error al registrarse', { description: getHttpErrorMessage(err) })
        } finally {
            setIsPending(false)
        }
    }

    return (
        <div className="w-full max-w-xs lg:max-w-md mx-auto p-6 space-y-6 bg-white rounded-xl shadow-md">
            {/* Header */}
            <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <ShieldCheck className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Portal Administrativo</h3>
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
                    Registrarse
                </button>
            </div>

            {/* Login Form */}
            {tab === 'login' && (
                <form onSubmit={loginForm.handleSubmit(onLogin)} className="grid gap-4">
                    <div className="grid gap-1.5">
                        <Label htmlFor="login-email">Correo electrónico</Label>
                        <Input id="login-email" type="email" placeholder="admin@spc.com" {...loginForm.register('email')} />
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
                    <p className="text-center text-xs text-muted-foreground">
                        Acceso por defecto: <strong>admin@spc.com</strong> / <strong>Admin123!</strong>
                    </p>
                </form>
            )}

            {/* Register Form */}
            {tab === 'register' && (
                <form onSubmit={registerForm.handleSubmit(onRegister)} className="grid gap-3">
                    <div className="grid gap-1.5">
                        <Label htmlFor="reg-name">Nombre completo *</Label>
                        <Input id="reg-name" placeholder="Juan Pérez" {...registerForm.register('name')} />
                        {registerForm.formState.errors.name && (
                            <p className="text-xs text-destructive">{registerForm.formState.errors.name.message}</p>
                        )}
                    </div>

                    <div className="grid gap-1.5">
                        <Label htmlFor="reg-email">Correo electrónico *</Label>
                        <Input id="reg-email" type="email" placeholder="docente@spc.com" {...registerForm.register('email')} />
                        {registerForm.formState.errors.email && (
                            <p className="text-xs text-destructive">{registerForm.formState.errors.email.message}</p>
                        )}
                    </div>

                    <div className="grid gap-1.5">
                        <Label htmlFor="reg-phone">Número de teléfono (opcional)</Label>
                        <Input id="reg-phone" placeholder="999 999 999" {...registerForm.register('phone')} />
                    </div>

                    <div className="grid gap-1.5">
                        <Label>Rol *</Label>
                        <Select
                            defaultValue="TEACHER"
                            onValueChange={(v) => registerForm.setValue('role', v as 'ADMIN' | 'TEACHER')}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="TEACHER">Docente</SelectItem>
                                <SelectItem value="ADMIN">Administrador</SelectItem>
                            </SelectContent>
                        </Select>
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

            {/* Link to student login */}
            <p className="text-center text-xs text-muted-foreground">
                ¿Eres estudiante?{' '}
                <Link to={PATHS.LOGIN} className="text-primary hover:underline font-medium">
                    Ingresa al portal estudiantil
                </Link>
            </p>
        </div>
    )
}
