import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Users, Search, Trash2, ToggleLeft, ToggleRight, GraduationCap } from 'lucide-react'
import { studentsAdminService, type StudentRecord } from '@/services/students-admin.service'
import { getHttpErrorMessage } from '@/lib/error'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { WarningDialog } from '@/components/common/WarningDialog'
import { SearchEngine } from '@/components/common/SearchEngine'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'

export default function StudentsAdminPage() {
    const queryClient = useQueryClient()
    const [search, setSearch] = useState('')

    const { data: students = [], isLoading } = useQuery({
        queryKey: ['admin-students', search],
        queryFn: () => studentsAdminService.findAll(search || undefined),
    })

    const toggleMutation = useMutation({
        mutationFn: (id: number) => studentsAdminService.toggleActive(id),
        onSuccess: (_, id) => {
            toast.success('Estado actualizado')
            queryClient.invalidateQueries({ queryKey: ['admin-students'] })
        },
        onError: (err) => toast.error('Error', { description: getHttpErrorMessage(err) }),
    })

    const deleteMutation = useMutation({
        mutationFn: (id: number) => studentsAdminService.remove(id),
        onSuccess: () => {
            toast.success('Estudiante eliminado')
            queryClient.invalidateQueries({ queryKey: ['admin-students'] })
        },
        onError: (err) => toast.error('Error', { description: getHttpErrorMessage(err) }),
    })

    return (
        <section className="space-y-4 p-4 lg:p-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                    <GraduationCap className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-semibold">Estudiantes registrados</h2>
                </div>
                <SearchEngine
                    value={search}
                    onSearch={setSearch}
                    placeholder="Buscar estudiante..."
                />
            </div>

            {/* Table */}
            <div className="border rounded-lg overflow-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Correo</TableHead>
                            <TableHead>DNI</TableHead>
                            <TableHead>Institución</TableHead>
                            <TableHead>Grado</TableHead>
                            <TableHead>Teléfono</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Registro</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}>
                                    {Array.from({ length: 9 }).map((_, j) => (
                                        <TableCell key={j}>
                                            <Skeleton className="h-4 w-full" />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : students.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} className="text-center text-muted-foreground py-10">
                                    No hay estudiantes registrados.
                                </TableCell>
                            </TableRow>
                        ) : (
                            students.map((student: StudentRecord) => (
                                <TableRow key={student.id}>
                                    <TableCell className="font-medium whitespace-nowrap">
                                        {student.firstName} {student.lastName}
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">{student.email}</TableCell>
                                    <TableCell>{student.dni}</TableCell>
                                    <TableCell className="max-w-[140px] truncate">{student.institutionName}</TableCell>
                                    <TableCell>{student.grade ?? '—'}</TableCell>
                                    <TableCell>{student.phone ?? '—'}</TableCell>
                                    <TableCell>
                                        <Badge variant={student.isActive ? 'default' : 'secondary'}>
                                            {student.isActive ? 'Activo' : 'Inactivo'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                                        {format(new Date(student.createdAt), "d MMM yyyy", { locale: es })}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7"
                                                title={student.isActive ? 'Desactivar' : 'Activar'}
                                                onClick={() => toggleMutation.mutate(student.id)}
                                                disabled={toggleMutation.isPending}
                                            >
                                                {student.isActive
                                                    ? <ToggleRight className="h-4 w-4 text-green-600" />
                                                    : <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                                                }
                                            </Button>
                                            <WarningDialog
                                                description={`Se eliminará el estudiante "${student.firstName} ${student.lastName}". Esta acción no se puede deshacer.`}
                                                onSubmit={() => deleteMutation.mutate(student.id)}
                                            >
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 text-destructive hover:text-destructive"
                                                    disabled={deleteMutation.isPending}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </WarningDialog>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <p className="text-xs text-muted-foreground">{students.length} estudiante(s) encontrado(s).</p>
        </section>
    )
}
