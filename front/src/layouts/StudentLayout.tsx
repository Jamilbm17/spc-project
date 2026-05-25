import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
    CalendarDays,
    BookOpen,
    LogOut,
    Menu,
    X,
    GraduationCap,
    LayoutDashboard,
} from 'lucide-react'
import { useStudentAuth } from '@/providers/StudentAuthProvider'
import { WarningDialog } from '@/components/common/WarningDialog'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { PATHS } from '@/router/paths'

const STUDENT_MENU = [
    { title: 'Inicio', url: PATHS.STUDENT.DASHBOARD, icon: LayoutDashboard },
    { title: 'Clases disponibles', url: PATHS.STUDENT.CALENDAR, icon: CalendarDays },
    { title: 'Mis inscripciones', url: PATHS.STUDENT.MY_ENROLLMENTS, icon: BookOpen },
]

export function StudentLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const { student, signOut } = useStudentAuth()
    const navigate = useNavigate()

    const initials = student?.name
        ? student.name
            .split(' ')
            .slice(0, 2)
            .map((n) => n[0])
            .join('')
            .toUpperCase()
        : 'ES'

    return (
        <div className="flex h-dvh overflow-hidden bg-background">
            {/* Sidebar overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    'fixed md:static inset-y-0 left-0 z-50 flex flex-col w-64 bg-sidebar border-r border-sidebar-border transition-transform duration-300',
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
                )}
            >
                {/* Logo */}
                <div className="flex items-center gap-3 px-4 py-4 border-b border-sidebar-border">
                    <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center flex-shrink-0">
                        <GraduationCap className="h-4 w-4 text-white" />
                    </div>
                    <div className="min-w-0">
                        <p className="font-semibold text-sm text-sidebar-foreground truncate">Portal Estudiantil</p>
                        <p className="text-xs text-muted-foreground truncate">SPC</p>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="ml-auto md:hidden h-7 w-7"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                {/* Student profile card */}
                <div className="px-4 py-3 border-b border-sidebar-border bg-primary/5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-bold text-white">{initials}</span>
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-sidebar-foreground truncate">{student?.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{student?.email}</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-4 px-2">
                    <p className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        Menú
                    </p>
                    <ul className="space-y-1">
                        {STUDENT_MENU.map((item) => (
                            <li key={item.url}>
                                <NavLink
                                    to={item.url}
                                    end
                                    onClick={() => setSidebarOpen(false)}
                                    className={({ isActive }) =>
                                        cn(
                                            'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                                            isActive
                                                ? 'bg-primary text-primary-foreground'
                                                : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                                        )
                                    }
                                >
                                    <item.icon className="h-4 w-4 flex-shrink-0" />
                                    {item.title}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Footer */}
                <div className="border-t border-sidebar-border p-3">
                    <WarningDialog description="Se cerrará tu sesión actual." onSubmit={signOut}>
                        <button className="flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors">
                            <LogOut className="h-4 w-4" />
                            Cerrar sesión
                        </button>
                    </WarningDialog>
                </div>
            </aside>

            {/* Main content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <header className="flex h-12 shrink-0 items-center gap-2 border-b bg-background px-4 lg:px-6">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden -ml-1 h-8 w-8"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Menu className="h-4 w-4" />
                    </Button>
                    <Separator orientation="vertical" className="mx-1 h-4 hidden md:block" />
                    <span className="text-sm font-medium text-muted-foreground">Portal Estudiantil</span>
                    <div className="ml-auto flex items-center gap-2">
                        <span className="text-sm text-muted-foreground hidden sm:block">{student?.name}</span>
                        <WarningDialog description="Se cerrará tu sesión actual." onSubmit={signOut}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <LogOut className="h-4 w-4" />
                            </Button>
                        </WarningDialog>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
