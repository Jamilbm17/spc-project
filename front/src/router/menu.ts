import {
    Activity,
    Building2,
    CalendarDays,
    Users,
    BookOpen,
    GraduationCap,
    type LucideIcon,
} from 'lucide-react'
import { PATHS } from './paths'

export const MENU_LINKS: Array<{
    title: string
    url: string
    icon: LucideIcon
}> = [
    {
        title: 'Actividades',
        url: PATHS.ACTIVITIES.INDEX,
        icon: Activity,
    },
    {
        title: 'Inscripciones',
        url: PATHS.ENROLLMENTS.INDEX,
        icon: GraduationCap,
    },
    {
        title: 'Estudiantes',
        url: PATHS.STUDENTS_ADMIN.INDEX,
        icon: Users,
    },
    {
        title: 'Instituciones',
        url: PATHS.INSTITUTIONS.INDEX,
        icon: Building2,
    },
    {
        title: 'Participantes',
        url: PATHS.PARTICIPANTS.INDEX,
        icon: Users,
    },
    {
        title: 'Temas',
        url: PATHS.TOPICS.INDEX,
        icon: BookOpen,
    },
    {
        title: 'Calendario',
        url: PATHS.CALENDAR.INDEX,
        icon: CalendarDays,
    },
] as const
