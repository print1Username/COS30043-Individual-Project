import { supabase } from '@/lib/supabase'

function parseProductImages(value) {
  if (!value) return []

  if (Array.isArray(value)) {
    return value.map(getImagePathFromValue).filter(Boolean)
  }

  if (typeof value !== 'string') return []

  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed)
      ? parsed.map(getImagePathFromValue).filter(Boolean)
      : [getImagePathFromValue(parsed)].filter(Boolean)
  } catch {
    return [getImagePathFromValue(value)].filter(Boolean)
  }
}

function getImagePathFromValue(value) {
  if (!value) return ''
  if (typeof value === 'string') return value

  if (typeof value === 'object') {
    return value.path || value.name || value.fullPath || value.full_path || value.url || ''
  }

  return ''
}

function removeBucketPrefix(path) {
  return path
    .replace(/^\/+/, '')
    .replace(/^products\/+/i, '')
    .replace(/^public\/products\/+/i, '')
    .replace(/^storage\/v1\/object\/public\/products\/+/i, '')
    .replace(/^storage\/v1\/object\/sign\/products\/+/i, '')
}

function getPublicProductImageUrl(path) {
  if (!path) return ''
  if (/^https?:\/\//i.test(path)) return path

  const { data } = supabase.storage.from('products').getPublicUrl(removeBucketPrefix(path))
  return data?.publicUrl || ''
}

async function getCurrentUserId() {
  const { data, error } = await supabase.auth.getSession()

  if (error) {
    console.error('[products:session] getSession error', error)
    throw error
  }

  const userId = data?.session?.user?.id
  if (!userId) {
    throw new Error('No authenticated user session found.')
  }

  return userId
}

function normalizeImagePath(product, path) {
  if (!path) return ''
  if (/^https?:\/\//i.test(path)) return path

  const cleanPath = removeBucketPrefix(path)
  if (cleanPath.includes('/')) return cleanPath

  return `${product.id}/${cleanPath}`
}

function isImageFile(file) {
  const name = file?.name || ''
  const mimeType = file?.metadata?.mimetype || file?.metadata?.mimeType || ''

  return (
    mimeType.startsWith('image/') ||
    /\.(avif|bmp|gif|jpe?g|png|webp)$/i.test(name)
  )
}

async function getFirstImageFromProductFolder(productId) {
  if (!productId) return ''

  const { data, error } = await supabase.storage.from('products').list(productId, {
    limit: 100,
    sortBy: {
      column: 'name',
      order: 'asc',
    },
  })

  if (error) {
    console.warn('[products:image:list] unable to list product images', error)
    return ''
  }

  const firstFile = (data || []).find(
    (item) => item.name && !item.name.endsWith('/') && isImageFile(item),
  )
  return firstFile ? `${productId}/${firstFile.name}` : ''
}

async function getProductImageUrl(path) {
  if (!path) return ''
  if (/^https?:\/\//i.test(path)) return path

  const cleanPath = removeBucketPrefix(path)

  const { data, error } = await supabase.storage.from('products').createSignedUrl(cleanPath, 3600)

  if (!error && data?.signedUrl) {
    return data.signedUrl
  }

  console.warn('[products:image:signed-url] using public url fallback', error)
  return getPublicProductImageUrl(cleanPath)
}

async function getProductImageUrls(paths = []) {
  return Promise.all(paths.map((path) => getProductImageUrl(path)))
}

export async function normalizeProduct(product) {
  const imagePaths = parseProductImages(product.product_image).map((path) =>
    normalizeImagePath(product, path),
  )
  const firstImagePath = imagePaths[0] || ''
  const folderImagePath = firstImagePath || (await getFirstImageFromProductFolder(product.id))
  const fullImagePaths = folderImagePath
    ? [folderImagePath, ...imagePaths.filter((path) => path && path !== folderImagePath)]
    : imagePaths
  const fullImageUrls = await getProductImageUrls(fullImagePaths)

  return {
    ...product,
    image_paths: fullImagePaths,
    image_urls: fullImageUrls,
    image_url: fullImageUrls[0] || '',
  }
}

// Helper: upload up to 10 image files to the `products` bucket under folder {productId}/
export async function uploadImages(userId, productId, files = []) {
  if (!files || files.length === 0) return []

  const uploaded = []

  for (let i = 0; i < files.length && i < 10; i++) {
    const file = files[i]
    const path = `${productId}/${Date.now()}_${i}_${file.name}`

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

  const userId = await getCurrentUserId()
  console.info('[products:create] current user id', userId)

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

    return normalizeProduct(updateData)
  }

  return normalizeProduct(insertData)
}

export async function getProducts({ page = 1, perPage = 10 } = {}) {
  const safePage = Math.max(Number(page) || 1, 1)
  const safePerPage = Math.max(Number(perPage) || 10, 1)
  const from = (safePage - 1) * safePerPage
  const to = from + safePerPage - 1

  const { data, error, count } = await supabase
    .from('products')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) throw error

  return {
    products: await Promise.all((data || []).map(normalizeProduct)),
    total: count || 0,
  }
}

export async function getProductById(id) {
  const userId = await getCurrentUserId()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single()
  if (error) throw error
  return normalizeProduct(data)
}

export async function updateProduct({
  id,
  payload = {},
  existingImagePaths = [],
  newFiles = [],
  deletedImagePaths = [],
} = {}) {
  if (!id) throw new Error('Product id is required.')

  const userId = await getCurrentUserId()
  const keptPaths = existingImagePaths.map(removeBucketPrefix).filter(Boolean).slice(0, 10)
  const uploadSlots = Math.max(10 - keptPaths.length, 0)
  const filesToUpload = (newFiles || []).slice(0, uploadSlots)
  let uploadedPaths = []
  let productRowSaved = false

  try {
    uploadedPaths = await uploadImages(userId, id, filesToUpload)
    const nextImagePaths = [...keptPaths, ...uploadedPaths].slice(0, 10)

    const row = {
      name: payload.name || 'Name',
      descriptions: payload.descriptions || null,
      value: payload.value != null ? Number(payload.value) : 1,
      price: payload.price != null ? Number(Number(payload.price).toFixed(2)) : 1,
      type: payload.type || null,
      product_image: nextImagePaths.length ? JSON.stringify(nextImagePaths) : null,
      update_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from('products')
      .update(row)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      console.error('[products:update] update error', error)
      throw error
    }
    productRowSaved = true

    const removablePaths = deletedImagePaths
      .map(removeBucketPrefix)
      .filter((path) => path && !/^https?:\/\//i.test(path))

    if (removablePaths.length) {
      const { error: removeError } = await supabase.storage.from('products').remove(removablePaths)

      if (removeError) {
        console.error('[products:update] remove images error', removeError)
        throw removeError
      }
    }

    return normalizeProduct(data)
  } catch (error) {
    if (uploadedPaths.length && !productRowSaved) {
      await supabase.storage.from('products').remove(uploadedPaths)
    }

    throw error
  }
}

export async function deleteProduct(id) {
  if (!id) throw new Error('Product id is required.')

  const userId = await getCurrentUserId()

  const { data, error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    console.error('[products:delete] delete error', error)
    throw error
  }

  return data
}
