import { useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, LogOut, ChevronDown } from 'lucide-react'
import { MENU_LINKS } from '@/router/menu'
import { useAuth } from '@/providers/AuthProvider'
import { WarningDialog } from '@/components/common/WarningDialog'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

export function AppLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const { pathname } = useLocation()
    const { user, signOut } = useAuth()
    const navigate = useNavigate()

    const currentTitle = MENU_LINKS.find((item) => pathname.startsWith(item.url))?.title || 'SPC'

    return (
        <div className="flex h-dvh overflow-hidden bg-background">
            {/* Sidebar overlay for mobile */}
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
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
                )}
            >
                {/* Logo */}
                <div className="flex items-center gap-3 px-4 py-4 border-b border-sidebar-border">
                    <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-white">SPC</span>
                    </div>
                    <div className="min-w-0">
                        <p className="font-semibold text-sm text-sidebar-foreground truncate">Prev. Comunitaria</p>
                        <p className="text-xs text-muted-foreground truncate">Sistema de Gestión</p>
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

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-4 px-2">
                    <p className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        Módulos
                    </p>
                    <ul className="space-y-1">
                        {MENU_LINKS.map((item) => (
                            <li key={item.url}>
                                <NavLink
                                    to={item.url}
                                    onClick={() => setSidebarOpen(false)}
                                    className={({ isActive }) =>
                                        cn(
                                            'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                                            isActive
                                                ? 'bg-primary text-primary-foreground'
                                                : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
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
                    <WarningDialog
                        description="Se cerrará su sesión actual."
                        onSubmit={signOut}
                    >
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
                <header
                    className="flex h-12 shrink-0 items-center gap-2 border-b bg-background px-4 lg:px-6"
                    style={{ height: 'var(--topbar-height, 48px)' }}
                >
                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden -ml-1 h-8 w-8"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Menu className="h-4 w-4" />
                    </Button>
                    <Separator orientation="vertical" className="mx-1 h-4 hidden md:block" />
                    <h1 className="text-base font-medium">{currentTitle}</h1>
                    <div className="ml-auto flex items-center gap-2">
                        <span className="text-sm text-muted-foreground hidden sm:block">{user?.name}</span>
                        <WarningDialog
                            description="Se cerrará su sesión actual."
                            onSubmit={signOut}
                        >
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <ChevronDown className="h-4 w-4" />
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
