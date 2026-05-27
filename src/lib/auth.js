import { supabase } from '@/lib/supabase'

function logAuthEvent(status, message, details = {}) {
  console.info(`[auth:${status}] ${message}`, details)
}

export async function handleSignUp({ username, email, password, redirectTo }) {
  if (!username || !email || !password) {
    logAuthEvent('failed', 'Sign up blocked: missing required fields')
    throw new Error('Please fill in all fields')
  }

  logAuthEvent('started', 'Signing up user', { email })

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
    logAuthEvent('failed', 'Sign up failed', { email, error: error.message })
    throw error
  }

  logAuthEvent('success', 'Sign up request completed', {
    email,
    userId: data.user?.id,
    hasSession: Boolean(data.session),
  })

  if (!data.session) {
    logAuthEvent('success', 'Confirmation email should be sent by Supabase', { email })
  }

  return data
}

export async function handleLogin({ email, password }) {
  if (!email || !password) {
    logAuthEvent('failed', 'Login blocked: missing email or password')
    throw new Error('Please enter your email and password')
  }

  logAuthEvent('started', 'Logging in user', { email })

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    logAuthEvent('failed', 'Login failed', { email, error: error.message })
    throw error
  }

  logAuthEvent('success', 'Login successful', {
    email,
    userId: data.user?.id,
    hasSession: Boolean(data.session),
  })

  return data
}

export async function handleForgotPassword({ email, redirectTo }) {
  if (!email) {
    logAuthEvent('failed', 'Password reset blocked: missing email')
    throw new Error('Please enter your email')
  }

  logAuthEvent('started', 'Sending password reset email', { email })

  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  })

  if (error) {
    logAuthEvent('failed', 'Password reset email failed', { email, error: error.message })
    throw error
  }

  logAuthEvent('success', 'Password reset request completed', {
    email,
    redirectTo,
  })

  return data
}

export async function handleUpdatePassword({ password }) {
  if (!password) {
    logAuthEvent('failed', 'Password update blocked: missing password')
    throw new Error('Please enter a new password')
  }

  logAuthEvent('started', 'Updating user password')

  const { data, error } = await supabase.auth.updateUser({
    password,
  })

  if (error) {
    logAuthEvent('failed', 'Password update failed', { error: error.message })
    throw error
  }

  logAuthEvent('success', 'Password updated successfully', {
    userId: data.user?.id,
  })

  return data
}

export async function exchangeCodeForSession(url) {
  const parsedUrl = new URL(url)

  if (!parsedUrl.searchParams.has('code')) {
    return null
  }

  logAuthEvent('started', 'Exchanging email redirect code for session')

  const { data, error } = await supabase.auth.exchangeCodeForSession(url)

  if (error) {
    logAuthEvent('failed', 'Email redirect code exchange failed', { error: error.message })
    throw error
  }

  logAuthEvent('success', 'Email redirect code exchanged for session', {
    userId: data.user?.id,
    hasSession: Boolean(data.session),
  })

  return data.session
}

export async function getCurrentSession() {
  const { data, error } = await supabase.auth.getSession()

  if (error) {
    logAuthEvent('failed', 'Current session check failed', { error: error.message })
    throw error
  }

  logAuthEvent(data.session ? 'success' : 'failed', 'Current session checked', {
    hasSession: Boolean(data.session),
    userId: data.session?.user?.id,
  })

  return data.session
}

export async function handleLogout() {
  logAuthEvent('started', 'Logging out user')

  const { error } = await supabase.auth.signOut()

  if (error) {
    logAuthEvent('failed', 'Logout failed', { error: error.message })
    throw error
  }

  logAuthEvent('success', 'User logged out successfully')

  return true
}
