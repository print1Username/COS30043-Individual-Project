import { supabase } from '@/lib/supabase'

async function getCurrentUserId() {
  const { data, error } = await supabase.auth.getSession()

  if (error) {
    console.error('[trades:session] getSession error', error)
    throw error
  }

  const userId = data?.session?.user?.id
  if (!userId) {
    throw new Error('No authenticated user session found.')
  }

  return userId
}

export function formatPrice(value) {
  return `RM ${Number(value || 0).toFixed(2)}`
}

export function calculateTotalPrice(quantity, unitPrice) {
  return Number((Number(quantity || 0) * Number(unitPrice || 0)).toFixed(2))
}

export async function createTrade({ productId, sellerId, quantity, unitPrice } = {}) {
  if (!productId) throw new Error('Product id is required.')
  if (!sellerId) throw new Error('Seller id is required.')

  const safeQuantity = Math.floor(Number(quantity) || 0)
  const safeUnitPrice = Number(unitPrice)

  if (safeQuantity < 1) {
    throw new Error('Quantity must be at least 1.')
  }

  if (Number.isNaN(safeUnitPrice) || safeUnitPrice <= 0) {
    throw new Error('Unit price must be greater than 0.')
  }

  const buyerId = await getCurrentUserId()
  if (buyerId === sellerId) {
    throw new Error('You cannot trade with your own product.')
  }

  const { data, error } = await supabase
    .rpc('create_trade', {
      p_products_id: productId,
      p_products_user_id: sellerId,
      p_value: safeQuantity,
      p_price: Number(safeUnitPrice.toFixed(2)),
    })
    .single()

  if (error) {
    console.error('[trades:create] rpc error', error)
    throw error
  }

  return data
}

export async function getUserTrades() {
  const userId = await getCurrentUserId()

  const { data, error } = await supabase
    .from('trades')
    .select('*, products:products_id(id, name, product_image)')
    .or(`products_user_id.eq.${userId},buyer.eq.${userId}`)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[trades:list] fetch error', error)
    throw error
  }

  return data || []
}

export async function getTradeById(tradeId) {
  if (!tradeId) throw new Error('Trade id is required.')

  const { data, error } = await supabase
    .from('trades')
    .select('*, products:products_id(id, name, descriptions, product_image)')
    .eq('id', tradeId)
    .single()

  if (error) {
    console.error('[trades:detail] fetch error', error)
    throw error
  }

  return data
}
