export type ApiError = {
    status?: number
    message?: string
    code?: string
} & Error

export const isNotFoundError = (error: unknown): boolean => {
    if (!error) return false
    const apiError = error as ApiError
    return apiError.status === 404 || apiError.code === 'NOT_FOUND'
}

export const isNetworkError = (error: unknown): boolean => {
    if (!error) return false
    const apiError = error as ApiError
    return !apiError.status || apiError.status >= 500
}