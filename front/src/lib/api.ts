import axios from 'axios'

export const api = axios.create({
    baseURL: '/api',
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
    baseURL: '/api',
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
