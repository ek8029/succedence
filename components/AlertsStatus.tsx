'use client'

import { useEffect, useState } from 'react'

interface AlertsStatusProps {
  className?: string
}

export default function AlertsStatus({ className = '' }: AlertsStatusProps) {
  const [alertsCount, setAlertsCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkTodaysAlerts() {
      try {
        const today = new Date().toISOString().split('T')[0]

        // Check if there's an alert digest for today
        // This would typically fetch from /api/alerts/today or similar
        // For now, we'll simulate this check

        // In a real implementation, you'd call:
        // const response = await fetch(`/api/alerts?date=${today}`)
        // const data = await response.json()
        // setAlertsCount(data.listing_ids?.length || 0)

        // Simulated for now
        setAlertsCount(0)
      } catch (error) {
        console.error('Error checking alerts:', error)
        setAlertsCount(null)
      } finally {
        setLoading(false)
      }
    }

    checkTodaysAlerts()
  }, [])

  if (loading) {
    return (
      <div className={`text-sm text-neutral-400 ${className}`}>
        Checking alerts...
      </div>
    )
  }

  if (alertsCount === null) {
    return null
  }

  if (alertsCount === 0) {
    return (
      <div className={`text-sm text-neutral-400 ${className}`}>
        No new match alerts today
      </div>
    )
  }

  return (
    <div className={`text-sm ${className}`}>
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gold/20 text-gold">
        {alertsCount} new match{alertsCount !== 1 ? 'es' : ''} today
      </span>
    </div>
  )
}