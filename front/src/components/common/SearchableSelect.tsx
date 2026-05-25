import { useState, useRef, useEffect } from 'react'
import { Check, ChevronDown, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface Option {
    value: number | string
    label: string
}

interface Props {
    options: Option[]
    value?: number | string
    onValueChange: (value: number | string | undefined) => void
    placeholder?: string
    searchPlaceholder?: string
    emptyLabel?: string
    clearable?: boolean
}

export function SearchableSelect({
    options,
    value,
    onValueChange,
    placeholder = 'Seleccionar...',
    searchPlaceholder = 'Buscar...',
    emptyLabel = 'Sin selección',
    clearable = true,
}: Props) {
    const [search, setSearch] = useState('')
    const [open, setOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    const selected = options.find((o) => o.value === value)
    const filtered = options.filter((o) =>
        o.label.toLowerCase().includes(search.toLowerCase()),
    )

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false)
                setSearch('')
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    const handleSelect = (val: number | string | undefined) => {
        onValueChange(val)
        setOpen(false)
        setSearch('')
    }

    return (
        <div ref={containerRef} className="relative">
            <button
                type="button"
                onClick={() => {
                    setOpen((prev) => !prev)
                    if (!open) setSearch('')
                }}
                className={cn(
                    'flex h-9 w-full items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors',
                    'hover:border-ring focus:outline-none focus:ring-1 focus:ring-ring',
                    !selected && 'text-muted-foreground',
                )}
            >
                <span className="truncate">{selected?.label ?? placeholder}</span>
                <div className="flex items-center gap-1 shrink-0">
                    {clearable && selected && (
                        <span
                            role="button"
                            tabIndex={0}
                            onClick={(e) => {
                                e.stopPropagation()
                                handleSelect(undefined)
                            }}
                            onKeyDown={(e) => e.key === 'Enter' && handleSelect(undefined)}
                            className="rounded-sm p-0.5 hover:bg-muted"
                        >
                            <X className="h-3 w-3" />
                        </span>
                    )}
                    <ChevronDown className={cn('h-4 w-4 opacity-50 transition-transform', open && 'rotate-180')} />
                </div>
            </button>

            {open && (
                <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md">
                    <div className="p-2 border-b">
                        <Input
                            autoFocus
                            placeholder={searchPlaceholder}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="h-8 text-sm"
                        />
                    </div>
                    <div className="max-h-52 overflow-y-auto py-1">
                        <button
                            type="button"
                            onClick={() => handleSelect(undefined)}
                            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        >
                            {emptyLabel}
                        </button>
                        {filtered.length === 0 ? (
                            <p className="px-3 py-4 text-center text-sm text-muted-foreground">
                                Sin resultados
                            </p>
                        ) : (
                            filtered.map((option) => (
                                <button
                                    type="button"
                                    key={option.value}
                                    onClick={() => handleSelect(option.value)}
                                    className={cn(
                                        'flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground',
                                        value === option.value && 'bg-accent/40 font-medium',
                                    )}
                                >
                                    <span className="w-4 shrink-0">
                                        {value === option.value && <Check className="h-3.5 w-3.5 text-primary" />}
                                    </span>
                                    <span className="truncate">{option.label}</span>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
