'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { User } from '@supabase/supabase-js'

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [weight, setWeight] = useState('')
  const [goal, setGoal] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession()
      const authUser = data.session?.user ?? null
      if (!authUser) {
        router.push('/') // not logged in → go to login
        return
      }
      setUser(authUser)

      // check if profile already exists
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (profile) {
        // profile exists → skip this page
        router.push('/dashboard')
        return
      }

      setLoading(false) // allow showing form
    }
    init()
  }, [router])

  const handleSave = async () => {
    if (!user) return
    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      name,
      age: age ? parseInt(age, 10) : null,
      weight: weight ? parseFloat(weight) : null,
      goal: goal || null,
    })
    if (error) setMessage(error.message)
    else {
      setMessage('✅ Profile saved!')
      router.push('/dashboard') // after saving, go to main app
    }
  }

  if (loading) return <p className="p-6">Loading...</p>

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Set up your Profile</h1>

      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border p-2 mb-2 w-full rounded"
      />

      <input
        type="number"
        placeholder="Age"
        value={age}
        onChange={(e) => setAge(e.target.value)}
        className="border p-2 mb-2 w-full rounded"
      />

      <input
        type="number"
        placeholder="Weight (kg)"
        value={weight}
        onChange={(e) => setWeight(e.target.value)}
        className="border p-2 mb-2 w-full rounded"
      />

      <select
        value={goal}
        onChange={(e) => setGoal(e.target.value)}
        className="border p-2 mb-2 w-full rounded"
      >
        <option value="">Select Goal</option>
        <option value="lose_weight">Lose Weight</option>
        <option value="gain_weight">Gain Weight</option>
        <option value="shredded">Shredded</option>
      </select>

      <button
        onClick={handleSave}
        className="bg-blue-600 text-white px-4 py-2 rounded w-full mt-2"
      >
        Save Profile
      </button>

      {message && <p className="mt-3 text-sm">{message}</p>}
    </div>
  )
}
