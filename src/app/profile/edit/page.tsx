'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function EditProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const [targetWeight, setTargetWeight] = useState<string>('')
  const [reminderTime, setReminderTime] = useState<string>('')

  useEffect(() => {
    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session?.user) {
        router.push('/')
        return
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('target_weight, reminder_time')
        .eq('id', session.user.id)
        .single()

      if (error) {
        setError(error.message)
      } else {
        setTargetWeight(
          data?.target_weight !== null && data?.target_weight !== undefined
            ? String(data.target_weight)
            : ''
        )
        setReminderTime(
          data?.reminder_time !== null && data?.reminder_time !== undefined
            ? String(data.reminder_time)
            : ''
        )
      }
      setLoading(false)
    }
    init()
  }, [router])

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setMessage(null)

    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session?.user) {
      router.push('/')
      return
    }

    const updatePayload: { target_weight?: number | null; reminder_time?: string | null } = {}
    updatePayload.target_weight = targetWeight ? Number(targetWeight) : null
    updatePayload.reminder_time = reminderTime ? reminderTime : null

    const { error } = await supabase
      .from('profiles')
      .update(updatePayload)
      .eq('id', session.user.id)

    if (error) {
      setError(error.message)
    } else {
      setMessage('✅ Profile updated')
      // re-fetch to reflect saved values
      const { data } = await supabase
        .from('profiles')
        .select('target_weight, reminder_time')
        .eq('id', session.user.id)
        .single()
      setTargetWeight(
        data?.target_weight !== null && data?.target_weight !== undefined
          ? String(data.target_weight)
          : ''
      )
      setReminderTime(
        data?.reminder_time !== null && data?.reminder_time !== undefined
          ? String(data.reminder_time)
          : ''
      )
    }
    setSaving(false)
  }

  if (loading) return <p className="p-6">Loading...</p>

  return (
    <div className="p-6 max-w-md mx-auto space-y-3">
      <h1 className="text-xl font-bold">Edit Profile</h1>

      <label className="block text-sm">Target Weight (kg)</label>
      <input
        type="number"
        value={targetWeight}
        onChange={(e) => setTargetWeight(e.target.value)}
        className="border p-2 w-full rounded"
        placeholder="e.g., 73"
      />

      <label className="block text-sm">Reminder Time</label>
      <input
        type="time"
        value={reminderTime}
        onChange={(e) => setReminderTime(e.target.value)}
        className="border p-2 w-full rounded"
      />

      <button
        onClick={handleSave}
        disabled={saving}
        className="bg-blue-600 text-white px-4 py-2 rounded w-full"
      >
        {saving ? 'Saving…' : 'Save'}
      </button>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {message && <p className="text-sm text-green-700">{message}</p>}
    </div>
  )
}


