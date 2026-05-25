import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { authService, type AuthUser } from '@/services/auth.service'
import { PATHS } from '@/router/paths'
import { Spinner } from '@/components/ui/spinner'

interface AuthContextType {
    user: AuthUser | null
    isAuthenticated: boolean
    signIn: (email: string, password: string) => Promise<void>
    signOut: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const navigate = useNavigate()
    const { pathname } = useLocation()

    useEffect(() => {
        const me = authService.getMe()
        setUser(me)
        setIsLoading(false)
    }, [])

    useEffect(() => {
        if (isLoading) return

        // Student paths and student login are handled by StudentAuthProvider — skip
        if (pathname.startsWith(PATHS.STUDENT.BASE) || pathname === PATHS.LOGIN) return

        const adminPublicPaths: string[] = [PATHS.LOGIN_ADMIN]
        if (!user && !adminPublicPaths.includes(pathname)) {
            navigate(PATHS.LOGIN_ADMIN, { replace: true })
        }
        if (user && pathname === PATHS.LOGIN_ADMIN) {
            navigate(PATHS.INDEX, { replace: true })
        }
    }, [user, isLoading, pathname, navigate])

    const signIn = async (email: string, password: string) => {
        const result = await authService.signIn({ email, password })
        localStorage.setItem('spc_token', result.accessToken)
        const me = authService.getMe()
        setUser(me)
        navigate(PATHS.INDEX, { replace: true })
    }

    const signOut = () => {
        localStorage.removeItem('spc_token')
        setUser(null)
        navigate(PATHS.LOGIN_ADMIN, { replace: true })
    }

    if (isLoading) {
        return (
            <div className="h-dvh flex justify-center items-center">
                <Spinner />
            </div>
        )
    }

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be inside AuthProvider')
    return ctx
}
