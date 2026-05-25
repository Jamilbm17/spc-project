import { studentApi } from '@/lib/api'

export interface StudentUser {
    sub: number
    email: string
    name: string
    type: 'student'
}

export interface StudentSignInDto {
    email: string
    password: string
}

export interface StudentRegisterDto {
    firstName: string
    lastName: string
    email: string
    password: string
    dni: string
    institutionName: string
    phone?: string
    grade?: string
}

function decodeJwt(token: string): StudentUser | null {
    try {
        const payload = token.split('.')[1]
        return JSON.parse(atob(payload)) as StudentUser
    } catch {
        return null
    }
}

export const studentAuthService = {
    async signIn(data: StudentSignInDto): Promise<{ accessToken: string }> {
        return studentApi.post('/auth/student/login', data) as Promise<{ accessToken: string }>
    },
    async register(data: StudentRegisterDto): Promise<{ accessToken: string }> {
        return studentApi.post('/auth/student/register', data) as Promise<{ accessToken: string }>
    },
    getMe(): StudentUser | null {
        const token = localStorage.getItem('spc_student_token')
        if (!token) return null
        const decoded = decodeJwt(token)
        if (decoded?.type !== 'student') return null
        return decoded
    },
}
