import { api } from '@/lib/api'

export interface Participant {
    id: number
    name: string
    documentNumber?: string
    phone?: string
    email?: string
    age?: number
    institutionId?: number
    institution?: { id: number; name: string }
    createdAt: string
    updatedAt: string
}

export interface CreateParticipantDto {
    name: string
    documentNumber?: string
    phone?: string
    email?: string
    age?: number
    institutionId?: number
}

export type UpdateParticipantDto = Partial<CreateParticipantDto>

export const participantService = {
    async findAll(query?: string): Promise<Participant[]> {
        const params: Record<string, string> = {}
        if (query) params.query = query
        return api.get('/participants', { params }) as Promise<Participant[]>
    },
    async findOne(id: number): Promise<Participant> {
        return api.get(`/participants/${id}`) as Promise<Participant>
    },
    async create(data: CreateParticipantDto): Promise<Participant> {
        return api.post('/participants', data) as Promise<Participant>
    },
    async update(id: number, data: UpdateParticipantDto): Promise<Participant> {
        return api.put(`/participants/${id}`, data) as Promise<Participant>
    },
    async remove(id: number): Promise<void> {
        return api.delete(`/participants/${id}`) as Promise<void>
    },
}
