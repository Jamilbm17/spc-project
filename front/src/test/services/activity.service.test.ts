import { describe, it, expect } from 'vitest'
import { activityStatusLabels } from '@/services/activity.service'

describe('activityStatusLabels', () => {
    it('traduce todos los estados al español', () => {
        expect(activityStatusLabels.SCHEDULED).toBe('Programada')
        expect(activityStatusLabels.IN_PROGRESS).toBe('En progreso')
        expect(activityStatusLabels.COMPLETED).toBe('Completada')
        expect(activityStatusLabels.CANCELLED).toBe('Cancelada')
    })

    it('cubre los 4 estados posibles', () => {
        const keys = Object.keys(activityStatusLabels)
        expect(keys).toHaveLength(4)
        expect(keys).toContain('SCHEDULED')
        expect(keys).toContain('IN_PROGRESS')
        expect(keys).toContain('COMPLETED')
        expect(keys).toContain('CANCELLED')
    })
})
