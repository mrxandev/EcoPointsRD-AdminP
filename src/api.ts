import axios from 'axios'

const API_URLS = {
  local: 'http://localhost:3000',
  prod: 'https://backend-ecopointsrd.onrender.com',
} as const

type ApiEnvironment = keyof typeof API_URLS

const env = (import.meta.env.VITE_ENV ?? 'local').toLowerCase()
const apiEnvironment: ApiEnvironment = env === 'prod' ? 'prod' : 'local'

export const apiBaseUrl = API_URLS[apiEnvironment]
export const apiDisplayUrl = apiBaseUrl

export const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`
    return
  }

  delete api.defaults.headers.common.Authorization
}

export const getApiErrorMessage = (error: unknown) => {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? 'No se pudo completar la solicitud.'
  }

  return 'Ocurrio un error inesperado.'
}
