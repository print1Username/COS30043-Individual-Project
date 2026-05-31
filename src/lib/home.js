import { supabase } from '@/lib/supabase'

async function getCurrentUserId() {
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  const userId = data?.session?.user?.id
  if (!userId) throw new Error('No authenticated user session found.')
  return userId
}

function getPublicImageUrl(productId, rawPath) {
  if (!rawPath) return ''
  if (/^https?:\/\//i.test(rawPath)) return rawPath

  const clean = rawPath
    .replace(/^\/+/, '')
    .replace(/^products\/+/i, '')
    .replace(/^public\/products\/+/i, '')

  const normalized = clean.includes('/') ? clean : `${productId}/${clean}`
  const { data } = supabase.storage.from('products').getPublicUrl(normalized)
  return data?.publicUrl || ''
}

function resolveFirstImage(product) {
  let paths = []
  try {
    if (Array.isArray(product.product_image)) {
      paths = product.product_image
    } else if (typeof product.product_image === 'string') {
      const parsed = JSON.parse(product.product_image)
      paths = Array.isArray(parsed) ? parsed : [parsed]
    }
  } catch {
    if (typeof product.product_image === 'string' && product.product_image) {
      paths = [product.product_image]
    }
  }
  const first = paths[0]
  if (!first) return ''
  const raw = typeof first === 'string' ? first : first?.path || ''
  return getPublicImageUrl(product.id, raw)
}

/**
 * Returns an array of 7 entries — one per day — for the past 7 days (today included).
 * Each entry: { label: 'Mon', date: '2024-06-10', count: 3 }
 * Counts how many products the current user created on each day.
 */
export async function getWeeklyProductCounts() {
  const userId = await getCurrentUserId()

  const now = new Date()
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now)
    d.setDate(now.getDate() - (6 - i))
    return d
  })

  const from = new Date(days[0])
  from.setHours(0, 0, 0, 0)
  const to = new Date(days[6])
  to.setHours(23, 59, 59, 999)

  const { data, error } = await supabase
    .from('products')
    .select('created_at')
    .eq('user_id', userId)
    .gte('created_at', from.toISOString())
    .lte('created_at', to.toISOString())

  if (error) throw error

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return days.map((d) => {
    const dateStr = d.toISOString().slice(0, 10)
    const count = (data || []).filter((row) => row.created_at.slice(0, 10) === dateStr).length
    return {
      label: dayLabels[d.getDay()],
      date: dateStr,
      count,
    }
  })
}

/**
 * Returns the most recent products from other users.
 * @param {number} limit
 */
export async function getRecentOtherProducts(limit = 10) {
  const userId = await getCurrentUserId()

  const { data, error } = await supabase
    .from('products')
    .select('id, user_id, name, descriptions, price, value, type, product_image, created_at')
    .neq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error

  return (data || []).map((product) => ({
    ...product,
    image_url: resolveFirstImage(product),
  }))
}
