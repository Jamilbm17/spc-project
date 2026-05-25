import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SearchableSelect } from '@/components/common/SearchableSelect'

const options = [
    { value: 1, label: 'Instituto Nacional' },
    { value: 2, label: 'Colegio Bilingüe' },
    { value: 3, label: 'Escuela Central' },
]

afterEach(() => vi.clearAllMocks())

describe('SearchableSelect', () => {
    it('muestra el placeholder cuando no hay valor seleccionado', () => {
        render(
            <SearchableSelect
                options={options}
                value={undefined}
                onValueChange={() => { }}
                placeholder="Seleccionar institución..."
            />,
        )
        expect(screen.getByText('Seleccionar institución...')).toBeInTheDocument()
    })

    it('muestra la etiqueta del valor seleccionado', () => {
        render(
            <SearchableSelect
                options={options}
                value={2}
                onValueChange={() => { }}
                placeholder="Seleccionar..."
            />,
        )
        expect(screen.getByText('Colegio Bilingüe')).toBeInTheDocument()
    })

    it('abre el dropdown al hacer clic en el botón', async () => {
        render(
            <SearchableSelect
                options={options}
                value={undefined}
                onValueChange={() => { }}
                placeholder="Seleccionar..."
            />,
        )
        const trigger = screen.getByRole('button')
        await userEvent.click(trigger)
        expect(screen.getByText('Instituto Nacional')).toBeInTheDocument()
        expect(screen.getByText('Colegio Bilingüe')).toBeInTheDocument()
        expect(screen.getByText('Escuela Central')).toBeInTheDocument()
    })

    it('filtra opciones al escribir en el campo de búsqueda', async () => {
        render(
            <SearchableSelect
                options={options}
                value={undefined}
                onValueChange={() => { }}
            />,
        )
        await userEvent.click(screen.getByRole('button'))
        const input = screen.getByRole('textbox')
        await userEvent.type(input, 'cole')
        expect(screen.getByText('Colegio Bilingüe')).toBeInTheDocument()
        expect(screen.queryByText('Instituto Nacional')).not.toBeInTheDocument()
        expect(screen.queryByText('Escuela Central')).not.toBeInTheDocument()
    })

    it('llama a onValueChange con el valor correcto al seleccionar una opción', async () => {
        const onChange = vi.fn()
        render(
            <SearchableSelect
                options={options}
                value={undefined}
                onValueChange={onChange}
            />,
        )
        await userEvent.click(screen.getByRole('button'))
        await userEvent.click(screen.getByText('Escuela Central'))
        expect(onChange).toHaveBeenCalledWith(3)
    })

    it('llama a onValueChange con undefined al limpiar la selección', async () => {
        const onChange = vi.fn()
        render(
            <SearchableSelect
                options={options}
                value={1}
                onValueChange={onChange}
                clearable
            />,
        )
        const clearBtn = screen.getByRole('button', { name: '' })
        // El botón de limpiar es el span[role=button] con el icono X
        const clearSpan = document.querySelector('[role="button"][tabindex="0"]') as HTMLElement
        fireEvent.click(clearSpan)
        expect(onChange).toHaveBeenCalledWith(undefined)
    })
})
