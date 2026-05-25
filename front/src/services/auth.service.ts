import { api } from '@/lib/api'

export interface AuthUser {
    sub: number
    email: string
    name: string
    role: string
    type: string
}

export interface SignInDto {
    email: string
    password: string
}

export interface RegisterAdminDto {
    name: string
    email: string
    password: string
    phone?: string
    role?: 'ADMIN' | 'TEACHER'
}

function decodeJwt(token: string): AuthUser | null {
    try {
        const payload = token.split('.')[1]
        return JSON.parse(atob(payload)) as AuthUser
    } catch {
        return null
    }
}

export const authService = {
    async signIn(data: SignInDto): Promise<{ accessToken: string }> {
        return api.post('/auth/login', data) as Promise<{ accessToken: string }>
    },
    async register(data: RegisterAdminDto): Promise<{ accessToken: string }> {
        return api.post('/auth/register', data) as Promise<{ accessToken: string }>
    },
    getMe(): AuthUser | null {
        const token = localStorage.getItem('spc_token')
        if (!token) return null
        return decodeJwt(token)
    },
}
