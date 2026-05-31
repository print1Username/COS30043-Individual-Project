import { supabase } from '@/lib/supabase'

/**
 * Get the current authenticated user's ID.
 * @returns {Promise<string>}
 */
async function getCurrentUserId() {
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  const userId = data?.session?.user?.id
  if (!userId) throw new Error('No authenticated user session found.')
  return userId
}

/**
 * Resolve a public image URL for a product image path stored in the products bucket.
 * Uses public URL directly since the bucket is public = true.
 * @param {string} path
 * @returns {string}
 */
function getPublicImageUrl(path) {
  if (!path) return ''
  if (/^https?:\/\//i.test(path)) return path

  const cleanPath = path
    .replace(/^\/+/, '')
    .replace(/^products\/+/i, '')
    .replace(/^public\/products\/+/i, '')

  const { data } = supabase.storage.from('products').getPublicUrl(cleanPath)
  return data?.publicUrl || ''
}

/**
 * Parse the first image path from a product's product_image field.
 * @param {Object} product
 * @returns {string}
 */
function resolveFirstImageUrl(product) {
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

  // Normalize: if path has no slash, prefix with productId folder
  const cleanFirst = typeof first === 'string' ? first : first?.path || ''
  const normalized = cleanFirst.includes('/') ? cleanFirst : `${product.id}/${cleanFirst}`

  return getPublicImageUrl(normalized)
}

/**
 * Format product type label from snake_case.
 * @param {string} value
 * @returns {string}
 */
export function formatProductType(value) {
  if (!value) return 'Uncategorized'
  return value
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Search the current user's own products by name or descriptions.
 * @param {string} query
 * @returns {Promise<Array>}
 */
export async function searchOwnProducts(query) {
  if (!query || !query.trim()) return []

  const userId = await getCurrentUserId()
  const q = query.trim()

  const { data, error } = await supabase
    .from('products')
    .select('id, user_id, name, descriptions, price, value, type, product_image, created_at')
    .eq('user_id', userId)
    .or(`name.ilike.%${q}%,descriptions.ilike.%${q}%`)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) throw error

  const seen = new Set()
  return (data || [])
    .filter((product) => {
      if (seen.has(product.id)) return false
      seen.add(product.id)
      return true
    })
    .map((product) => ({
      ...product,
      image_url: resolveFirstImageUrl(product),
      is_own: true,
    }))
}

/**
 * Search other users' products by name or descriptions.
 * Requires "Select all products" RLS policy on the products table.
 * @param {string} query
 * @returns {Promise<Array>}
 */
export async function searchOtherProducts(query) {
  if (!query || !query.trim()) return []

  const userId = await getCurrentUserId()
  const q = query.trim()

  const { data, error } = await supabase
    .from('products')
    .select('id, user_id, name, descriptions, price, value, type, product_image, created_at')
    .neq('user_id', userId)
    .or(`name.ilike.%${q}%,descriptions.ilike.%${q}%`)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) throw error

  const seen = new Set()
  return (data || [])
    .filter((product) => {
      if (seen.has(product.id)) return false
      seen.add(product.id)
      return true
    })
    .map((product) => ({
      ...product,
      image_url: resolveFirstImageUrl(product),
      is_own: false,
    }))
}
