import { api } from '@/lib/api'

export interface Topic {
    id: number
    name: string
    description?: string
    active: boolean
    createdAt: string
    updatedAt: string
}

export interface CreateTopicDto {
    name: string
    description?: string
    active?: boolean
}

export type UpdateTopicDto = Partial<CreateTopicDto>

export const topicService = {
    async findAll(query?: string): Promise<Topic[]> {
        const params: Record<string, string> = {}
        if (query) params.query = query
        return api.get('/topics', { params }) as Promise<Topic[]>
    },
    async findOne(id: number): Promise<Topic> {
        return api.get(`/topics/${id}`) as Promise<Topic>
    },
    async create(data: CreateTopicDto): Promise<Topic> {
        return api.post('/topics', data) as Promise<Topic>
    },
    async update(id: number, data: UpdateTopicDto): Promise<Topic> {
        return api.put(`/topics/${id}`, data) as Promise<Topic>
    },
    async remove(id: number): Promise<void> {
        return api.delete(`/topics/${id}`) as Promise<void>
    },
}
