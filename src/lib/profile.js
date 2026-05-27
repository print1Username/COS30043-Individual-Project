import { supabase } from '@/lib/supabase'

export async function getProfile(userId) {
  if (!userId) {
    throw new Error('Missing user id')
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, display_name, avatar_url, bio, created_at, update_at')
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    throw error
  }

  return data
}

export async function upsertProfile(userId, profileUpdates) {
  if (!userId) {
    throw new Error('Missing user id')
  }

  if (!profileUpdates?.username) {
    throw new Error('Username is required before saving profile changes')
  }

  // First try to UPDATE the existing profile
  const updatePayload = {
    ...profileUpdates,
    update_at: new Date().toISOString(),
  }

  const { data: updateData, error: updateError } = await supabase
    .from('profiles')
    .update(updatePayload)
    .eq('id', userId)
    .select('id, username, display_name, avatar_url, bio, created_at, update_at')
    .maybeSingle()

  if (updateError) {
    throw updateError
  }

  // If update found no rows, insert a new profile
  if (!updateData) {
    const insertPayload = {
      id: userId,
      ...profileUpdates,
      update_at: new Date().toISOString(),
    }

    const { data: insertData, error: insertError } = await supabase
      .from('profiles')
      .insert(insertPayload)
      .select('id, username, display_name, avatar_url, bio, created_at, update_at')
      .single()

    if (insertError) {
      throw insertError
    }

    return insertData
  }

  return updateData
}

export function normalizeUsername(input) {
  if (!input) return ''
  return input
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
}

export function validateUsername(username) {
  const normalized = normalizeUsername(username)
  const hasInvalidChars = normalized !== (username || '')
  return { normalized, hasInvalidChars }
}

export async function uploadAvatar(userId, file) {
  if (!userId) {
    throw new Error('Missing user id')
  }

  const allowedTypes = ['image/png', 'image/jpeg']
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Only PNG and JPEG formats are supported')
  }

  if (file.size > 10 * 1024 * 1024) {
    throw new Error('Image size cannot exceed 10MB')
  }

  const extension = file.type === 'image/png' ? 'png' : 'jpg'
  const fileName = `avatar-${Date.now()}.${extension}`
  const filePath = `${userId}/${fileName}`

  const { error } = await supabase.storage.from('avatar').upload(filePath, file)

  if (error) {
    throw error
  }

  return filePath
}

export async function getAvatarUrl(path) {
  if (!path) {
    return ''
  }

  const { data, error } = await supabase.storage.from('avatar').createSignedUrl(path, 60)

  if (error) {
    throw error
  }

  return data.signedUrl
}
