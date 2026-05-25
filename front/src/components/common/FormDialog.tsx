import { type ReactNode } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
    title: string
    children: ReactNode
    onSubmit: () => void
    isPending?: boolean
    submitLabel?: string
}

export function FormDialog({
    open,
    onOpenChange,
    title,
    children,
    onSubmit,
    isPending = false,
    submitLabel = 'Guardar',
}: Props) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-primary">{title}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-2">{children}</div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
                        Cancelar
                    </Button>
                    <Button onClick={onSubmit} disabled={isPending}>
                        {isPending && <Spinner className="h-4 w-4" />}
                        {submitLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
