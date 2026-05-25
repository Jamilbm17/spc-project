import { Search, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface Props {
    placeholder?: string
    value?: string
    onSearch: (value: string) => void
}

export function SearchEngine({ placeholder = 'Buscar...', value = '', onSearch }: Props) {
    const [localValue, setLocalValue] = useState(value)

    useEffect(() => {
        setLocalValue(value)
    }, [value])

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') onSearch(localValue)
    }

    const handleClear = () => {
        setLocalValue('')
        onSearch('')
    }

    return (
        <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
                className="pl-9 pr-9"
                placeholder={placeholder}
                value={localValue}
                onChange={(e) => setLocalValue(e.target.value)}
                onKeyDown={handleKeyDown}
            />
            {localValue && (
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                    onClick={handleClear}
                >
                    <X className="h-3 w-3" />
                </Button>
            )}
        </div>
    )
}
