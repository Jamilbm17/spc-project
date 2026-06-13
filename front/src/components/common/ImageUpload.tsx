import { useRef, useState } from 'react'
import { ImageIcon, X, Upload } from 'lucide-react'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Props {
    value?: string
    onChange: (url: string | undefined) => void
    className?: string
}

export function ImageUpload({ value, onChange, className }: Props) {
    const inputRef = useRef<HTMLInputElement>(null)
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return
        setError(null)
        setUploading(true)
        try {
            const formData = new FormData()
            formData.append('file', file)
            const res = await api.post<{ url: string }>('/upload/image', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            }) as unknown as { url: string }
            onChange(res.url)
        } catch {
            setError('Error al subir la imagen. Máx 5 MB.')
        } finally {
            setUploading(false)
            if (inputRef.current) inputRef.current.value = ''
        }
    }

    return (
        <div className={cn('space-y-2', className)}>
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFile}
            />

            {value ? (
                <div className="relative w-full h-40 rounded-lg overflow-hidden border bg-muted">
                    <img
                        src={value}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none'
                        }}
                    />
                    <button
                        type="button"
                        onClick={() => onChange(undefined)}
                        className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-black/80 transition-colors"
                    >
                        <X className="h-3.5 w-3.5" />
                    </button>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    disabled={uploading}
                    className="w-full h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
                >
                    {uploading ? (
                        <>
                            <Upload className="h-6 w-6 animate-bounce" />
                            <span className="text-xs">Subiendo...</span>
                        </>
                    ) : (
                        <>
                            <ImageIcon className="h-6 w-6" />
                            <span className="text-xs font-medium">Haz clic para subir imagen</span>
                            <span className="text-xs opacity-70">PNG, JPG, WEBP · Máx 5 MB</span>
                        </>
                    )}
                </button>
            )}

            {value && (
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full gap-1.5"
                    disabled={uploading}
                    onClick={() => inputRef.current?.click()}
                >
                    <Upload className="h-3.5 w-3.5" />
                    {uploading ? 'Subiendo...' : 'Cambiar imagen'}
                </Button>
            )}

            {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
    )
}
