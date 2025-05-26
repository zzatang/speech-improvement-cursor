import { useState, useCallback } from 'react'
import type { ApiResponse, ApiError } from '@/types/api'

interface UseApiOptions {
  onSuccess?: (data: any) => void
  onError?: (error: ApiError) => void
}

interface UseApiReturn<T> {
  data: T | null
  loading: boolean
  error: ApiError | null
  execute: (...args: any[]) => Promise<T | null>
  reset: () => void
}

export function useApi<T = any>(
  apiFunction: (...args: any[]) => Promise<Response>,
  options: UseApiOptions = {}
): UseApiReturn<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)

  const execute = useCallback(async (...args: any[]): Promise<T | null> => {
    try {
      setLoading(true)
      setError(null)

      const response = await apiFunction(...args)
      
      if (!response.ok) {
        const errorData: ApiError = await response.json()
        setError(errorData)
        options.onError?.(errorData)
        return null
      }

      const result: T = await response.json()
      setData(result)
      options.onSuccess?.(result)
      return result

    } catch (err) {
      const apiError: ApiError = {
        error: 'Network error',
        details: err instanceof Error ? err.message : 'Unknown error',
        statusCode: 0,
      }
      setError(apiError)
      options.onError?.(apiError)
      return null
    } finally {
      setLoading(false)
    }
  }, [apiFunction, options])

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setLoading(false)
  }, [])

  return {
    data,
    loading,
    error,
    execute,
    reset,
  }
} 