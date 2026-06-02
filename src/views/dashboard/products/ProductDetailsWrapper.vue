<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { getAnyProductById, isProductOwner, getCurrentUserId } from '@/lib/products'
import ProductsDetailsView from './ProductsDetailsView.vue'
import ProductViewReadOnly from './ProductViewReadOnly.vue'

const route = useRoute()
const isOwner = ref(null)
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    const productId = route.params.id
    if (!productId) {
      error.value = 'Product ID is missing.'
      loading.value = false
      return
    }

    const [product, currentUserId] = await Promise.all([
      getAnyProductById(productId),
      getCurrentUserId(),
    ])

    isOwner.value = isProductOwner(product.user_id, currentUserId)
    loading.value = false
  } catch (err) {
    console.error('[products:wrapper] error', err)
    error.value = err?.message || 'Unable to determine product access.'
    loading.value = false
  }
})
</script>

<template>
  <div v-if="loading" class="wrapper-loader">
    <v-skeleton-loader type="image, article, actions" />
  </div>
  <v-alert v-else-if="error" type="error" variant="tonal">
    {{ error }}
  </v-alert>
  <ProductsDetailsView v-else-if="isOwner" />
  <ProductViewReadOnly v-else />
</template>

<style scoped>
.wrapper-loader {
  min-height: 100vh;
  padding: 104px 32px 96px;
  background:
    radial-gradient(circle at top left, rgba(66, 184, 131, 0.14), transparent 34%), #050806;
}
</style>
