import { studentApi } from '@/lib/api'
import type { Activity } from './activity.service'

export interface Enrollment {
    id: number
    studentId: number
    activityId: number
    status: 'ENROLLED' | 'CANCELLED'
    enrolledAt: string
    activity?: Activity
}

export interface EnrollmentCheck {
    enrolled: boolean
    enrollmentId: number | null
}

export interface AdminEnrollment {
    id: number
    studentId: number
    activityId: number
    status: 'ENROLLED' | 'CANCELLED'
    enrolledAt: string
    student: {
        id: number
        firstName: string
        lastName: string
        email: string
        dni: string
        institutionName: string
        phone?: string
        grade?: string
    }
}

export const enrollmentService = {
    async enroll(activityId: number): Promise<Enrollment> {
        return studentApi.post('/enrollments', { activityId }) as Promise<Enrollment>
    },
    async cancel(enrollmentId: number): Promise<{ message: string }> {
        return studentApi.delete(`/enrollments/${enrollmentId}`) as Promise<{ message: string }>
    },
    async findMy(): Promise<Enrollment[]> {
        return studentApi.get('/enrollments/my') as Promise<Enrollment[]>
    },
    async check(activityId: number): Promise<EnrollmentCheck> {
        return studentApi.get(`/enrollments/check/${activityId}`) as Promise<EnrollmentCheck>
    },
}
