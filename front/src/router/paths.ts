export const PATHS = {
    LOGIN: '/login',
    LOGIN_ADMIN: '/login/admin',
    INDEX: '/',
    ACTIVITIES: {
        INDEX: '/activities',
        TASKS: '/activities/:id/tasks',
    },
    INSTITUTIONS: {
        INDEX: '/institutions',
    },
    PARTICIPANTS: {
        INDEX: '/participants',
    },
    TOPICS: {
        INDEX: '/topics',
    },
    CALENDAR: {
        INDEX: '/calendar',
    },
    ENROLLMENTS: {
        INDEX: '/enrollments',
    },
    STUDENTS_ADMIN: {
        INDEX: '/students-admin',
    },
    COURSES: {
        INDEX: '/courses',
        DETAIL: '/courses/:id',
    },
    STUDENT: {
        BASE: '/student',
        DASHBOARD: '/student/dashboard',
        CALENDAR: '/student/calendar',
        MY_ENROLLMENTS: '/student/my-classes',
        COURSES: '/student/courses',
        COURSE_DETAIL: '/student/courses/:id',
        MY_COURSES: '/student/my-courses',
        TASK_DETAIL: '/student/tasks/:postId',
    },
} as const
