import { logError } from './logger'

const API_BASE = '/api'

async function request(path, options = {}) {
  let response

  try {
    response = await fetch(`${API_BASE}${path}`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      ...options,
    })
  } catch (err) {
    logError('Network request failed', { path, message: err?.message })
    throw err
  }

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const error = data.error || 'Request failed'
    logError('API error response', {
      path,
      status: response.status,
      statusText: response.statusText,
      error,
    })
    throw new Error(error)
  }
  return data
}

export const api = {
  async register(payload) {
    return request('/auth/register', { method: 'POST', body: JSON.stringify(payload) })
  },
  async login(payload) {
    return request('/auth/login', { method: 'POST', body: JSON.stringify(payload) })
  },
  async logout() {
    return request('/auth/logout', { method: 'POST' })
  },
  async me() {
    return request('/auth/me', { method: 'GET' })
  },
  async getStudies() {
    return request('/studies', { method: 'GET' })
  },
  async getStudy(id) {
    return request(`/studies/${id}`, { method: 'GET' })
  },
  async getProgress(studyId) {
    return request(`/progress?study_id=${encodeURIComponent(studyId)}`, { method: 'GET' })
  },
  async updateProgress(studyId, day, completed) {
    return request('/progress', {
      method: 'POST',
      body: JSON.stringify({ study_id: studyId, day, completed }),
    })
  },
  async listNotes() {
    return request('/notes', { method: 'GET' })
  },
  async createNote(payload) {
    return request('/notes', { method: 'POST', body: JSON.stringify(payload) })
  },
  async updateNote(id, payload) {
    return request(`/notes/${id}`, { method: 'PATCH', body: JSON.stringify(payload) })
  },
  async deleteNote(id) {
    return request(`/notes/${id}`, { method: 'DELETE' })
  },
  async listBookmarks() {
    return request('/bookmarks', { method: 'GET' })
  },
  async addBookmark(payload) {
    return request('/bookmarks', { method: 'POST', body: JSON.stringify(payload) })
  },
  async removeBookmark(id) {
    return request(`/bookmarks/${id}`, { method: 'DELETE' })
  },
  async searchBible(params) {
    const usp = new URLSearchParams(params)
    return request(`/bible/search?${usp.toString()}`, { method: 'GET' })
  },
  async lookupVerse(params) {
    const usp = new URLSearchParams(params)
    return request(`/bible/lookup?${usp.toString()}`, { method: 'GET' })
  },
  async listTopics(params = {}) {
    const usp = new URLSearchParams(params)
    const query = usp.toString()
    const suffix = query ? `?${query}` : ''
    return request(`/topics${suffix}`, { method: 'GET' })
  },
  async getTopic(slug) {
    return request(`/topics/${slug}`, { method: 'GET' })
  },
}
