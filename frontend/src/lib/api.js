export class ApiError extends Error {
  constructor(message, status = 0, errors = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
  }
}

export async function apiRequest(path, { token, method = 'GET', body } = {}) {
  const headers = { Accept: 'application/json' }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const options = { method, headers }

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
    options.body = JSON.stringify(body)
  }

  let response

  try {
    response = await fetch(`/api${path}`, options)
  } catch {
    throw new ApiError('Unable to connect to the Laravel server. Check that it is running.')
  }

  let result = null

  if (response.status !== 204) {
    const contentType = response.headers.get('content-type') || ''

    if (contentType.includes('application/json')) {
      try {
        result = await response.json()
      } catch {
        throw new ApiError('The server returned an invalid JSON response.', response.status)
      }
    }
  }

  if (!response.ok) {
    throw new ApiError(
      result?.message || `Request failed (HTTP ${response.status}).`,
      response.status,
      result?.errors || {},
    )
  }

  return result
}
