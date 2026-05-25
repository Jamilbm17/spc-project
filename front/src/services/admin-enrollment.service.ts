import { api } from '@/lib/api'
import type { AdminEnrollment } from './enrollment.service'

export const adminEnrollmentService = {
    async findByActivity(activityId: number): Promise<AdminEnrollment[]> {
        return api.get(`/enrollments/activity/${activityId}`) as Promise<AdminEnrollment[]>
    },
}
