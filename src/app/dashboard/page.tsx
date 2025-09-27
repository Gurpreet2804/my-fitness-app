'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [currentWeight, setCurrentWeight] = useState<number | null>(null)
  const [targetWeight, setTargetWeight] = useState<number | null>(null)
  const [weightError, setWeightError] = useState<string | null>(null)
  const [timeToExercise, setTimeToExercise] = useState<string | null>(null)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }


  useEffect(() => {
    const getUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.user) {
        router.push('/') // redirect to login if not signed in
        setLoading(false)
        return
      }

      const user = session.user
      setUser(user)

      const { data, error } = await supabase
        .from('profiles')
        .select('weight, target_weight, workout_time')
        .eq('id', user.id)
        .single()

      if (error) {
        setWeightError(error.message)
      } else {
        setCurrentWeight(
          data?.weight !== null && data?.weight !== undefined
            ? Number(data.weight)
            : null
        )
        setTargetWeight(
          data?.target_weight !== null && data?.target_weight !== undefined
            ? Number(data.target_weight)
            : null
        )
        setTimeToExercise(
          data?.workout_time !== null && data?.workout_time !== undefined
            ? String(data.workout_time)
            : null
        )
      }
      setLoading(false)
    }

    getUser()
  }, [router])

  if (loading) return <p className="p-6">Loading...</p>

  return (
    <div className="p-6 space-y-6">
      {/* Greeting */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          Hi, {user?.email?.split('@')[0]} 👋
        </h1>
        <button onClick={handleLogout} className="px-3 py-2 bg-red-500 text-white rounded">
          Logout
        </button>
      </div>
      <p className="text-gray-600">
        Welcome back! Ready to smash your goals today?
      </p>

      {/* Goal Summary */}
      <div className="border rounded-lg p-4 shadow">
        <h2 className="text-xl font-semibold mb-2">Your Goal</h2>
        <p>🎯 Goal: Lose 5kg</p>
        <p>
          ⚖️ Current weight: {currentWeight !== null ? `${currentWeight}kg` : '—'}
        </p>
        <p>
          🏁 Target weight: {targetWeight !== null ? `${targetWeight}kg` : '—'}
        </p>
        {weightError && (
          <p className="text-sm text-red-600 mt-1">{weightError}</p>
        )}
        <div className="w-full bg-gray-200 h-2 rounded mt-2">
          <div className="bg-green-500 h-2 rounded" style={{ width: '20%' }} />
        </div>
        <p className="text-sm text-gray-500 mt-1">20% progress</p>
      </div>

      {/* Today’s Reminder */}
      <div className="border rounded-lg p-4 shadow">
        <h2 className="text-xl font-semibold mb-2">Today’s Reminder</h2>
        <p>🏋️ Gym at {timeToExercise} — don’t forget!</p>
      </div>

      {/* Suggested Workout */}
      <div className="border rounded-lg p-4 shadow">
        <h2 className="text-xl font-semibold mb-2">Suggested Workout</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Pushups — 3 × 12</li>
          <li>Squats — 3 × 15</li>
          <li>Plank — 3 × 30s</li>
          <li>Jumping Jacks — 3 × 40</li>
        </ul>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-4">
        <button className="px-4 py-2 bg-green-500 text-white rounded">
          Mark workout done
        </button>
        <button
          onClick={() => router.push('/profile/edit')}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Edit profile
        </button>
      </div>
    </div>
  )
}
