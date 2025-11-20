const LOG_ENDPOINT = '/api/logs'

function serializeDetails(details) {
  try {
    return typeof structuredClone === 'function' ? structuredClone(details) : JSON.parse(JSON.stringify(details))
  } catch (err) {
    return { message: 'Failed to serialize details', fallback: String(err) }
  }
}

export function logError(message, details = {}) {
  if (!message) return

  const payload = { message, details: serializeDetails(details) }
  const body = JSON.stringify(payload)

  try {
    if (navigator?.sendBeacon) {
      const blob = new Blob([body], { type: 'application/json' })
      navigator.sendBeacon(LOG_ENDPOINT, blob)
      return
    }
  } catch (err) {
    console.log(err);
  }

  fetch(LOG_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: true,
  }).catch(() => {
    // Swallow logging errors to avoid cascading failures.
  })
}

export function attachGlobalErrorLogging() {
  if (typeof window === 'undefined') return

  window.addEventListener('error', (event) => {
    logError(event.message, {
      source: event.filename,
      line: event.lineno,
      column: event.colno,
    })
  })

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason || {}
    logError(reason.message || 'Unhandled promise rejection', {
      reason: typeof reason === 'object' ? reason : { value: reason },
    })
  })
}
