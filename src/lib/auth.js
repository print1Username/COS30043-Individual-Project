import { supabase } from '@/lib/supabase'

export async function handleSignUp({ username, email, password, redirectTo }) {
  if (!username || !email || !password) {
    throw new Error('Please fill in all fields')
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: redirectTo,
      data: {
        username,
      },
    },
  })

  if (error) {
    throw error
  }

  return data
}

export async function getCurrentSession() {
  const { data, error } = await supabase.auth.getSession()

  if (error) {
    throw error
  }

  return data.session
}
