import { api } from '@/lib/api'

export interface StudentRecord {
    id: number
    firstName: string
    lastName: string
    email: string
    dni: string
    institutionName: string
    phone?: string
    grade?: string
    isActive: boolean
    createdAt: string
}

export const studentsAdminService = {
    async findAll(query?: string): Promise<StudentRecord[]> {
        const params: Record<string, string> = {}
        if (query) params.query = query
        return api.get('/students', { params }) as Promise<StudentRecord[]>
    },
    async findOne(id: number): Promise<StudentRecord> {
        return api.get(`/students/${id}`) as Promise<StudentRecord>
    },
    async toggleActive(id: number): Promise<{ message: string }> {
        return api.patch(`/students/${id}/toggle`) as Promise<{ message: string }>
    },
    async remove(id: number): Promise<void> {
        return api.delete(`/students/${id}`) as Promise<void>
    },
}
