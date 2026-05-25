import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/layouts/AppLayout'
import { AuthLayout } from '@/layouts/AuthLayout'
import { StudentLayout } from '@/layouts/StudentLayout'
import { StudentAuthWrapper } from '@/providers/StudentAuthProvider'
import { PATHS } from './paths'

// Admin / shared pages
import AdminLoginPage from '@/pages/login/AdminLoginPage'
import ActivitiesPage from '@/pages/activities/ActivitiesPage'
import InstitutionsPage from '@/pages/institutions/InstitutionsPage'
import ParticipantsPage from '@/pages/participants/ParticipantsPage'
import TopicsPage from '@/pages/topics/TopicsPage'
import CalendarPage from '@/pages/calendar/CalendarPage'
import EnrollmentsAdminPage from '@/pages/enrollments/EnrollmentsAdminPage'
import StudentsAdminPage from '@/pages/students/StudentsAdminPage'

// Student pages
import StudentLoginPage from '@/pages/login/StudentLoginPage'
import StudentDashboardPage from '@/pages/student/StudentDashboardPage'
import StudentCalendarPage from '@/pages/student/StudentCalendarPage'
import StudentMyEnrollmentsPage from '@/pages/student/StudentMyEnrollmentsPage'

export function AppRoutes() {
    return (
        <Routes>
            {/* ── Public: Student login / register ── */}
            <Route element={<AuthLayout />}>
                <Route path={PATHS.LOGIN} element={<StudentLoginPage />} />
            </Route>

            {/* ── Public: Admin / teacher login / register ── */}
            <Route element={<AuthLayout />}>
                <Route path={PATHS.LOGIN_ADMIN} element={<AdminLoginPage />} />
            </Route>

            {/* ── Student portal (protected by StudentAuthWrapper) ── */}
            <Route element={<StudentAuthWrapper />}>
                <Route element={<StudentLayout />}>
                    <Route path={PATHS.STUDENT.BASE} element={<Navigate to={PATHS.STUDENT.DASHBOARD} replace />} />
                    <Route path={PATHS.STUDENT.DASHBOARD} element={<StudentDashboardPage />} />
                    <Route path={PATHS.STUDENT.CALENDAR} element={<StudentCalendarPage />} />
                    <Route path={PATHS.STUDENT.MY_ENROLLMENTS} element={<StudentMyEnrollmentsPage />} />
                </Route>
            </Route>

            {/* ── Admin portal (protected by AuthProvider in App.tsx) ── */}
            <Route element={<AppLayout />}>
                <Route path={PATHS.INDEX} element={<Navigate to={PATHS.ACTIVITIES.INDEX} replace />} />
                <Route path={PATHS.ACTIVITIES.INDEX} element={<ActivitiesPage />} />
                <Route path={PATHS.INSTITUTIONS.INDEX} element={<InstitutionsPage />} />
                <Route path={PATHS.PARTICIPANTS.INDEX} element={<ParticipantsPage />} />
                <Route path={PATHS.TOPICS.INDEX} element={<TopicsPage />} />
                <Route path={PATHS.CALENDAR.INDEX} element={<CalendarPage />} />
                <Route path={PATHS.ENROLLMENTS.INDEX} element={<EnrollmentsAdminPage />} />
                <Route path={PATHS.STUDENTS_ADMIN.INDEX} element={<StudentsAdminPage />} />
            </Route>

            <Route path="*" element={<Navigate to={PATHS.INDEX} replace />} />
        </Routes>
    )
}
