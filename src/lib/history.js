import { supabase } from '@/lib/supabase'

/**
 * Gets the current authenticated user's ID
 * @returns {Promise<string>}
 */
async function getCurrentUserId() {
  const { data, error } = await supabase.auth.getSession()

  if (error) {
    console.error('[history:session] getSession error', error)
    throw error
  }

  const userId = data?.session?.user?.id
  if (!userId) {
    throw new Error('No authenticated user session found.')
  }

  return userId
}

/**
 * Fetch paginated history records for the authenticated user
 * @param {Object} params
 * @param {number} params.page - Current page number (1-based)
 * @param {number} params.perPage - Items per page
 * @returns {Promise<{ history: Array, total: number }>}
 */
export async function getHistory({ page = 1, perPage = 30 } = {}) {
  try {
    const userId = await getCurrentUserId()
    const safePage = Math.max(Number(page) || 1, 1)
    const safePerPage = Math.max(Number(perPage) || 30, 1)
    const from = (safePage - 1) * safePerPage
    const to = from + safePerPage - 1

    const { data, error, count } = await supabase
      .from('history')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) {
      console.error('[history:fetch] Error fetching history:', error)
      throw error
    }

    return {
      history: data || [],
      total: count || 0,
    }
  } catch (error) {
    console.error('[history:getHistory] Failed:', error)
    throw error
  }
}
