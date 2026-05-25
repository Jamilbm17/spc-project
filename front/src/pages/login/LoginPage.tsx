import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/providers/AuthProvider'
import { getHttpErrorMessage } from '@/lib/error'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'

const schema = z.object({
    email: z.string().email('Correo electrónico inválido'),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
})

type FormValues = z.infer<typeof schema>

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false)
    const [isPending, setIsPending] = useState(false)
    const { signIn } = useAuth()

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: { email: '', password: '' },
    })

    const onSubmit = async (values: FormValues) => {
        setIsPending(true)
        try {
            await signIn(values.email, values.password)
            toast.success('Sesión iniciada correctamente')
        } catch (err) {
            toast.error('Error al iniciar sesión', {
                description: getHttpErrorMessage(err),
            })
        } finally {
            setIsPending(false)
        }
    }

    return (
        <div className="w-full max-w-xs lg:max-w-md mx-auto p-6 space-y-8 bg-white rounded-lg shadow-md">
            <div className="text-center">
                <h3 className="text-xl font-semibold">Ingresar a tu cuenta</h3>
                <p className="text-sm text-muted-foreground mt-1">Sistema de Prevención Comunitaria</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
                {/* Email */}
                <div className="grid gap-1.5">
                    <Label htmlFor="email">Correo electrónico</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="admin@spc.com"
                        {...register('email')}
                    />
                    {errors.email && (
                        <p className="text-xs text-destructive">{errors.email.message}</p>
                    )}
                </div>

                {/* Password */}
                <div className="grid gap-1.5">
                    <Label htmlFor="password">Contraseña</Label>
                    <div className="relative">
                        <Input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            {...register('password')}
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <EyeOff className="h-4 w-4 text-gray-500" /> : <Eye className="h-4 w-4" />}
                        </Button>
                    </div>
                    {errors.password && (
                        <p className="text-xs text-destructive">{errors.password.message}</p>
                    )}
                </div>

                <Button type="submit" disabled={isPending} className="mt-2">
                    {isPending ? <Spinner className="h-4 w-4" /> : null}
                    Iniciar sesión
                </Button>
            </form>

            <p className="text-center text-xs text-muted-foreground">
                Credenciales por defecto: <strong>admin@spc.com</strong> / <strong>Admin123!</strong>
            </p>
        </div>
    )
}
