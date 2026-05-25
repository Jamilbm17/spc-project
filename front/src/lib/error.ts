import axios from 'axios'

const defaultMessage = 'Ups! Ocurrió un error inesperado'

export const getHttpErrorMessage = (error: unknown): string => {
    if (axios.isAxiosError(error)) {
        const data = error.response?.data
        if (data?.message) return data.message
        if (error.code === 'NETWORK_ERROR' || !error.response) {
            return 'Error de conexión. Verifica tu conexión a internet.'
        }
    }
    return defaultMessage
}
