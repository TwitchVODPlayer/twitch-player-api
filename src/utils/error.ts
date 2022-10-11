interface FormattedError {
  error: string
  status: number
  message?: string
  [key: string]: any
}

/**
 * Format error
 * @param error
 */
export function formatError (error: FormattedError = {
  error: 'Error',
  status: 500
}): FormattedError {
  return {
    ...error,
    error: error?.error,
    status: error?.status,
    message: error?.message
  }
}
