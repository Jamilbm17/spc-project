import { describe, it, expect } from 'vitest'
import axios from 'axios'
import { getHttpErrorMessage } from '@/lib/error'

describe('getHttpErrorMessage', () => {
    it('retorna el mensaje del servidor cuando existe', () => {
        const err = new axios.AxiosError('Error')
        err.response = { data: { message: 'El correo ya está registrado' } } as any
        expect(getHttpErrorMessage(err)).toBe('El correo ya está registrado')
    })

    it('retorna mensaje de red cuando no hay respuesta', () => {
        const err = new axios.AxiosError('Network Error')
        err.code = 'NETWORK_ERROR'
        expect(getHttpErrorMessage(err)).toBe('Error de conexión. Verifica tu conexión a internet.')
    })

    it('retorna mensaje genérico para errores desconocidos', () => {
        expect(getHttpErrorMessage(new Error('algo raro'))).toBe(
            'Ups! Ocurrió un error inesperado',
        )
    })

    it('retorna mensaje genérico para valores no-Error', () => {
        expect(getHttpErrorMessage('string error')).toBe('Ups! Ocurrió un error inesperado')
        expect(getHttpErrorMessage(null)).toBe('Ups! Ocurrió un error inesperado')
    })
})
