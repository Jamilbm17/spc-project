import { api } from '@/lib/api'

export interface Activity {
    id: number
    title: string
    description?: string
    date: string
    startTime?: string
    endTime?: string
    location?: string
    status: ActivityStatus
    expectedParticipants?: number
    institutionId?: number
    topicId?: number
    institution?: { id: number; name: string }
    topic?: { id: number; name: string }
    createdAt: string
    updatedAt: string
}

export type ActivityStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'

export interface CreateActivityDto {
    title: string
    description?: string
    date: string
    startTime?: string
    endTime?: string
    location?: string
    status?: ActivityStatus
    expectedParticipants?: number
    institutionId?: number
    topicId?: number
}

export type UpdateActivityDto = Partial<CreateActivityDto>

export const activityStatusLabels: Record<ActivityStatus, string> = {
    SCHEDULED: 'Programada',
    IN_PROGRESS: 'En progreso',
    COMPLETED: 'Completada',
    CANCELLED: 'Cancelada',
}

export const activityService = {
    async findAll(query?: string, month?: string): Promise<Activity[]> {
        const params: Record<string, string> = {}
        if (query) params.query = query
        if (month) params.month = month
        return api.get('/activities', { params }) as Promise<Activity[]>
    },
    async findCalendar(year: number, month: number): Promise<Activity[]> {
        return api.get('/activities/calendar', { params: { year, month } }) as Promise<Activity[]>
    },
    async findOne(id: number): Promise<Activity> {
        return api.get(`/activities/${id}`) as Promise<Activity>
    },
    async create(data: CreateActivityDto): Promise<Activity> {
        return api.post('/activities', data) as Promise<Activity>
    },
    async update(id: number, data: UpdateActivityDto): Promise<Activity> {
        return api.put(`/activities/${id}`, data) as Promise<Activity>
    },
    async remove(id: number): Promise<void> {
        return api.delete(`/activities/${id}`) as Promise<void>
    },
}
