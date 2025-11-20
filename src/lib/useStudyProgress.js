import { useEffect, useState } from 'react'
import { api } from './apiClient'
import { useAuth } from './useAuth'

export function useStudyProgress(studyId, totalDays) {
  const { user } = useAuth()
  const [completedDays, setCompletedDays] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    const load = async () => {
      if (!user) {
        if (isMounted) {
          setCompletedDays(new Set())
          setLoading(false)
          setError(null)
        }
        return
      }

      if (isMounted) {
        setLoading(true)
        setError(null)
      }

      try {
        const res = await api.getProgress(studyId)
        if (isMounted) setCompletedDays(new Set(res.days || []))
      } catch (err) {
        if (isMounted) setError(err.message)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    load()

    return () => {
      isMounted = false
    }
  }, [studyId, user])

  const toggleDay = async (day) => {
    if (!user) {
      setError('You need to be signed in to track progress.')
      return
    }
    const isCompleted = completedDays.has(day)
    const res = await api.updateProgress(studyId, day, !isCompleted)
    setCompletedDays(new Set(res.days || []))
  }

  const percentComplete = totalDays ? Math.round((completedDays.size / totalDays) * 100) : 0

  return {
    completedDays,
    loading,
    error,
    percentComplete,
    toggleDay,
  }
}
