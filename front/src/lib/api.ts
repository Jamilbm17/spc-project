import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? ''

export const resolveUploadUrl = (path: string | null | undefined): string | undefined => {
    if (!path) return undefined
    if (path.startsWith('http')) return path
    return `${API_BASE}${path}`
}

export const api = axios.create({
    baseURL: `${API_BASE}/api`,
})

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('spc_token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

api.interceptors.response.use(
    (response) => response.data,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('spc_token')
            if (window.location.pathname !== '/login/admin') {
                window.location.href = '/login/admin'
            }
        }
        return Promise.reject(error)
    },
)

// Separate axios instance for student API calls
export const studentApi = axios.create({
    baseURL: `${API_BASE}/api`,
})

studentApi.interceptors.request.use((config) => {
    const token = localStorage.getItem('spc_student_token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

studentApi.interceptors.response.use(
    (response) => response.data,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('spc_student_token')
            if (!window.location.pathname.startsWith('/login')) {
                window.location.href = '/login'
            }
        }
        return Promise.reject(error)
    },
)
