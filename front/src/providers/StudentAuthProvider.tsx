import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { useNavigate, useLocation, Outlet } from 'react-router-dom'
import { studentAuthService, type StudentUser } from '@/services/student-auth.service'
import { PATHS } from '@/router/paths'
import { Spinner } from '@/components/ui/spinner'

interface StudentAuthContextType {
    student: StudentUser | null
    isAuthenticated: boolean
    signIn: (email: string, password: string) => Promise<void>
    signOut: () => void
}

const StudentAuthContext = createContext<StudentAuthContextType | null>(null)

export function StudentAuthProvider({ children }: { children: ReactNode }) {
    const [student, setStudent] = useState<StudentUser | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const navigate = useNavigate()
    const { pathname } = useLocation()

    useEffect(() => {
        const me = studentAuthService.getMe()
        setStudent(me)
        setIsLoading(false)
    }, [])

    useEffect(() => {
        if (isLoading) return
        if (!student && pathname !== PATHS.LOGIN) {
            navigate(PATHS.LOGIN, { replace: true })
        }
        if (student && pathname === PATHS.LOGIN) {
            navigate(PATHS.STUDENT.DASHBOARD, { replace: true })
        }
    }, [student, isLoading, pathname, navigate])

    const signIn = async (email: string, password: string) => {
        const result = await studentAuthService.signIn({ email, password })
        localStorage.setItem('spc_student_token', result.accessToken)
        const me = studentAuthService.getMe()
        setStudent(me)
        navigate(PATHS.STUDENT.DASHBOARD, { replace: true })
    }

    const signOut = () => {
        localStorage.removeItem('spc_student_token')
        setStudent(null)
        navigate(PATHS.LOGIN, { replace: true })
    }

    if (isLoading) {
        return (
            <div className="h-dvh flex justify-center items-center">
                <Spinner />
            </div>
        )
    }

    return (
        <StudentAuthContext.Provider value={{ student, isAuthenticated: !!student, signIn, signOut }}>
            {children}
        </StudentAuthContext.Provider>
    )
}

/** Wrapper component for use in nested routes (renders <Outlet />) */
export function StudentAuthWrapper() {
    return (
        <StudentAuthProvider>
            <Outlet />
        </StudentAuthProvider>
    )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useStudentAuth() {
    const ctx = useContext(StudentAuthContext)
    if (!ctx) throw new Error('useStudentAuth must be inside StudentAuthProvider')
    return ctx
}
