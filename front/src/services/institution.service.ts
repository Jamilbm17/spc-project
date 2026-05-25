import { api } from '@/lib/api'

export type InstitutionType = 'SCHOOL' | 'COMMUNITY' | 'OTHER'

export interface Institution {
    id: number
    name: string
    type: InstitutionType
    address?: string
    city?: string
    contactName?: string
    contactPhone?: string
    active: boolean
    createdAt: string
    updatedAt: string
}

export interface CreateInstitutionDto {
    name: string
    type: InstitutionType
    address?: string
    city?: string
    contactName?: string
    contactPhone?: string
    active?: boolean
}

export type UpdateInstitutionDto = Partial<CreateInstitutionDto>

export const institutionTypeLabels: Record<InstitutionType, string> = {
    SCHOOL: 'Colegio',
    COMMUNITY: 'Comunidad',
    OTHER: 'Otro',
}

export const institutionService = {
    async findAll(query?: string): Promise<Institution[]> {
        const params: Record<string, string> = {}
        if (query) params.query = query
        return api.get('/institutions', { params }) as Promise<Institution[]>
    },
    async findOne(id: number): Promise<Institution> {
        return api.get(`/institutions/${id}`) as Promise<Institution>
    },
    async create(data: CreateInstitutionDto): Promise<Institution> {
        return api.post('/institutions', data) as Promise<Institution>
    },
    async update(id: number, data: UpdateInstitutionDto): Promise<Institution> {
        return api.put(`/institutions/${id}`, data) as Promise<Institution>
    },
    async remove(id: number): Promise<void> {
        return api.delete(`/institutions/${id}`) as Promise<void>
    },
}
