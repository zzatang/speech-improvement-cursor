import { NextResponse } from 'next/server'
import type { ApiError } from '@/types/api'

export class ApiErrorHandler {
  static createErrorResponse(
    error: string,
    details?: string,
    statusCode: number = 500
  ): NextResponse<ApiError> {
    const errorResponse: ApiError = {
      error,
      statusCode,
    }
    
    if (details) {
      errorResponse.details = details
    }
    
    return NextResponse.json(errorResponse, { status: statusCode })
  }

  static handleUnknownError(error: unknown): NextResponse<ApiError> {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    
    console.error('API Error:', error)
    
    return this.createErrorResponse(
      'Internal server error',
      errorMessage,
      500
    )
  }

  static createValidationError(message: string): NextResponse<ApiError> {
    return this.createErrorResponse(
      'Validation error',
      message,
      400
    )
  }

  static createUnauthorizedError(): NextResponse<ApiError> {
    return this.createErrorResponse(
      'Unauthorized',
      'Authentication required',
      401
    )
  }

  static createNotFoundError(resource?: string): NextResponse<ApiError> {
    return this.createErrorResponse(
      'Not found',
      resource ? `${resource} not found` : 'Resource not found',
      404
    )
  }
} 