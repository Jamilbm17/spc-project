import { Outlet, useLocation } from 'react-router-dom'

export function AuthLayout() {
    const { pathname } = useLocation()
    const isAdminLogin = pathname === '/login/admin'

    return (
        <div className="grid md:grid-cols-2 items-stretch h-dvh">
            {/* Left panel */}
            <div className="bg-primary justify-center items-center flex-col hidden md:flex gap-6">
                <div className="text-center text-white px-8">
                    <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-6">
                        <span className="text-4xl font-bold text-white">SPC</span>
                    </div>
                    <h1 className="text-4xl font-bold mb-3">¡Bienvenido!</h1>
                    <p className="text-xl text-white/80">Sistema de Prevención Comunitaria</p>
                    <p className="text-sm text-white/60 mt-2">
                        {isAdminLogin
                            ? 'Panel de gestión para docentes y administradores'
                            : 'Inscríbete en las clases disponibles para tu comunidad'}
                    </p>
                </div>
            </div>
            {/* Right panel */}
            <div className="flex flex-col justify-center items-center gap-10 bg-gray-100 overflow-y-auto py-8">
                <div className="text-center md:hidden">
                    <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mx-auto mb-3">
                        <span className="text-2xl font-bold text-white">SPC</span>
                    </div>
                </div>
                <Outlet />
            </div>
        </div>
    )
}
