/**
 * @typedef {Object} ErrorOptions
 */

/**
 * Format error
 * @param {ErrorOptions} [options] 
 * @returns 
 */
export function formatError(options = {}) {
    return {
        ...options,
        error: options.error || "Error",
        status: options.status || 500,
        message: options.message || undefined,
    }
}