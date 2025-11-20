const DB_NAME = 'tea-time-study'
const DB_VERSION = '1.0'
const DB_DESCRIPTION = 'Tea Time study progress (SQLite via WebSQL)'
const DB_SIZE = 5 * 1024 * 1024
const FALLBACK_KEY = 'tea-time-progress-fallback'

const openDatabaseInstance = () => {
  if (typeof window === 'undefined') return null
  if (typeof window.openDatabase !== 'function') return null
  return window.openDatabase(DB_NAME, DB_VERSION, DB_DESCRIPTION, DB_SIZE)
}

const ensureTable = (db) =>
  new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS study_progress (
            study_id TEXT NOT NULL,
            day INTEGER NOT NULL,
            completed_at TEXT NOT NULL,
            PRIMARY KEY (study_id, day)
          )`,
        )
      },
      reject,
      resolve,
    )
  })

const hydrateFromFallback = () => {
  if (typeof window === 'undefined') return {}
  const saved = window.localStorage.getItem(FALLBACK_KEY)
  return saved ? JSON.parse(saved) : {}
}

const persistFallback = (data) => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(FALLBACK_KEY, JSON.stringify(data))
}

const fallbackStore = {
  async allForStudy(studyId) {
    const record = hydrateFromFallback()
    return new Set(record[studyId] || [])
  },
  async toggle(studyId, day) {
    const record = hydrateFromFallback()
    const existing = new Set(record[studyId] || [])
    if (existing.has(day)) {
      existing.delete(day)
    } else {
      existing.add(day)
    }
    record[studyId] = Array.from(existing)
    persistFallback(record)
    return existing
  },
}

export async function getStudyProgress(studyId) {
  const db = openDatabaseInstance()
  if (!db) return fallbackStore.allForStudy(studyId)

  await ensureTable(db)

  return new Promise((resolve, reject) => {
    db.readTransaction(
      (tx) => {
        tx.executeSql(
          'SELECT day FROM study_progress WHERE study_id = ? ORDER BY day ASC',
          [studyId],
          (_, result) => {
            const days = new Set()
            for (let i = 0; i < result.rows.length; i += 1) {
              days.add(result.rows.item(i).day)
            }
            resolve(days)
          },
        )
      },
      reject,
    )
  })
}

export async function toggleDayCompletion(studyId, day) {
  const db = openDatabaseInstance()
  if (!db) return fallbackStore.toggle(studyId, day)

  await ensureTable(db)

  const existing = await new Promise((resolve, reject) => {
    db.readTransaction(
      (tx) => {
        tx.executeSql(
          'SELECT day FROM study_progress WHERE study_id = ? AND day = ?',
          [studyId, day],
          (_, result) => resolve(result.rows.length > 0),
        )
      },
      reject,
    )
  })

  const mutation = existing
    ? 'DELETE FROM study_progress WHERE study_id = ? AND day = ?'
    : 'INSERT INTO study_progress (study_id, day, completed_at) VALUES (?, ?, ?)'

  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        const params = existing ? [studyId, day] : [studyId, day, new Date().toISOString()]
        tx.executeSql(mutation, params)
      },
      reject,
      async () => {
        const updated = await getStudyProgress(studyId)
        resolve(updated)
      },
    )
  })
}

export async function getAllProgress() {
  const db = openDatabaseInstance()
  if (!db) {
    const record = hydrateFromFallback()
    return record
  }

  await ensureTable(db)

  return new Promise((resolve, reject) => {
    db.readTransaction(
      (tx) => {
        tx.executeSql('SELECT study_id, day FROM study_progress ORDER BY study_id, day', [], (_, result) => {
          const grouped = {}
          for (let i = 0; i < result.rows.length; i += 1) {
            const row = result.rows.item(i)
            grouped[row.study_id] = grouped[row.study_id] || []
            grouped[row.study_id].push(row.day)
          }
          resolve(grouped)
        })
      },
      reject,
    )
  })
}
