import { useEffect, useState } from 'react'
import { getStudyProgress, toggleDayCompletion } from './progressStore'

export function useStudyProgress(studyId, totalDays) {
  const [completedDays, setCompletedDays] = useState(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    getStudyProgress(studyId).then((days) => {
      if (!isMounted) return
      setCompletedDays(new Set(days))
      setLoading(false)
    })

    return () => {
      isMounted = false
    }
  }, [studyId])

  const toggleDay = async (day) => {
    const updated = await toggleDayCompletion(studyId, day)
    setCompletedDays(new Set(updated))
  }

  const percentComplete = totalDays ? Math.round((completedDays.size / totalDays) * 100) : 0

  return {
    completedDays,
    loading,
    percentComplete,
    toggleDay,
  }
}
