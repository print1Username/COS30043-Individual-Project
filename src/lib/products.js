import { supabase } from '@/lib/supabase'

// Helper: upload up to 10 image files to the `products` bucket under folder {userId}/{productId}/
export async function uploadImages(userId, productId, files = []) {
  if (!files || files.length === 0) return []

  const uploaded = []

  for (let i = 0; i < files.length && i < 10; i++) {
    const file = files[i]
    const path = `${userId}/${productId}/${Date.now()}_${i}_${file.name}`

    const { error } = await supabase.storage.from('products').upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    })

    if (error) {
      console.error('[products:upload] upload error', error)
      throw error
    }

    uploaded.push(path)
  }

  return uploaded
}

export async function createProduct(payload = {}, files = []) {
  // payload should include: name, descriptions, value, price, type
  const productId =
    payload.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : null)
  if (!productId) throw new Error('Unable to generate product id')

  const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
  if (sessionError) {
    console.error('[products:create] getSession error', sessionError)
    throw sessionError
  }

  const userId = sessionData?.session?.user?.id
  console.info('[products:create] current user id', userId)
  if (!userId) {
    throw new Error('No authenticated user session found.')
  }

  // Insert row first, before uploading images
  const row = {
    id: productId,
    user_id: userId,
    name: payload.name || 'Name',
    descriptions: payload.descriptions || null,
    value: payload.value != null ? Number(payload.value) : 1,
    price: payload.price != null ? Number(Number(payload.price).toFixed(2)) : 1,
    type: payload.type || null,
    product_image: null,
  }
  console.info('[products:create] inserting row', row)

  const { data: insertData, error: insertError } = await supabase
    .from('products')
    .insert([row])
    .select()
    .single()
  if (insertError) {
    console.error('[products:create] insert error', insertError)
    throw insertError
  }

  let paths = []
  if (files.length > 0) {
    paths = await uploadImages(userId, productId, files)

    const { data: sessionDataAfter, error: sessionErrorAfter } = await supabase.auth.getSession()
    if (sessionErrorAfter) {
      console.error('[products:create] getSession after upload error', sessionErrorAfter)
      throw sessionErrorAfter
    }

    const userIdAfter = sessionDataAfter?.session?.user?.id
    console.info('[products:create] current user id after upload', userIdAfter)
    if (!userIdAfter) {
      throw new Error('Authenticated session expired after image upload.')
    }

    const { data: updateData, error: updateError } = await supabase
      .from('products')
      .update({ product_image: paths.length ? JSON.stringify(paths) : null })
      .eq('id', productId)
      .select()
      .single()

    if (updateError) {
      console.error('[products:create] update product image error', updateError)
      throw updateError
    }

    return updateData
  }

  return insertData
}

export async function getProducts() {
  const { data, error } = await supabase.from('products').select('*')
  if (error) throw error
  return data
}

export async function getProductById(id) {
  const { data, error } = await supabase.from('products').select('*').eq('id', id).single()
  if (error) throw error
  return data
}
