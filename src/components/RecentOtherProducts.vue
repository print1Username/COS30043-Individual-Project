<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getRecentOtherProducts } from '@/lib/home'

const products = ref([])
const loading = ref(false)
const error = ref('')
const router = useRouter()

function formatType(value) {
  if (!value) return 'Uncategorized'
  return value
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function formatPrice(value) {
  return `RM ${Number(value || 0).toFixed(2)}`
}

function timeAgo(isoString) {
  if (!isoString) return ''
  const diff = Date.now() - new Date(isoString).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function openProduct(product) {
  router.push(`/dashboard/products/${product.id}`)
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    products.value = await getRecentOtherProducts(10)
  } catch (err) {
    console.error('[home:recent]', err)
    error.value = err?.message || 'Failed to load recent products.'
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<template>
  <v-card class="recent-card pa-5 h-100" elevation="0">
    <div class="recent-header mb-4">
      <div>
        <p class="text-overline text-primary mb-1">Marketplace</p>
        <h2 class="recent-title">Recent Products</h2>
      </div>
      <v-btn
        to="/dashboard/search"
        variant="tonal"
        color="primary"
        size="small"
        rounded="md"
        prepend-icon="mdi-magnify"
      >
        Browse
      </v-btn>
    </div>

    <div v-if="loading" class="recent-loading">
      <v-progress-circular indeterminate color="primary" size="36" />
    </div>

    <v-alert v-else-if="error" type="error" variant="tonal" density="compact">
      {{ error }}
    </v-alert>

    <div v-else-if="products.length === 0" class="recent-empty">
      <v-icon icon="mdi-store-off-outline" size="48" color="#35495e" class="mb-2" />
      <p class="text-body-2 text-medium-emphasis">No other users' products yet.</p>
    </div>

    <div v-else class="recent-list">
      <article
        v-for="product in products"
        :key="product.id"
        class="recent-item"
        role="button"
        tabindex="0"
        @click="openProduct(product)"
        @keydown.enter.prevent="openProduct(product)"
        @keydown.space.prevent="openProduct(product)"
      >
        <div class="recent-image">
          <v-img
            v-if="product.image_url"
            :src="product.image_url"
            :alt="product.name"
            cover
            class="recent-photo"
          />
          <div v-else class="recent-image-default">
            <v-icon icon="mdi-image-off-outline" size="20" />
          </div>
        </div>

        <div class="recent-body">
          <div class="recent-name-row">
            <span class="recent-name">{{ product.name }}</span>
            <span class="recent-time">{{ timeAgo(product.created_at) }}</span>
          </div>
          <div class="recent-meta">
            <v-chip size="x-small" color="primary" variant="tonal">
              {{ formatType(product.type) }}
            </v-chip>
            <span class="recent-price">{{ formatPrice(product.price) }}</span>
          </div>
        </div>
      </article>
    </div>
  </v-card>
</template>

<style scoped>
.recent-card {
  background: #0d1511;
  border: 1px solid rgba(66, 184, 131, 0.14);
  border-radius: 12px;
  overflow: hidden;
}

.recent-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.recent-title {
  font-size: 18px;
  font-weight: 700;
  color: #e7f8ee;
}

.recent-loading,
.recent-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
}

.recent-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow-y: auto;
  max-height: 520px;
}

.recent-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 8px;
  border-radius: 8px;
  transition: background 0.15s;
  cursor: pointer;
}

.recent-item:hover,
.recent-item:focus-visible {
  background: rgba(66, 184, 131, 0.08);
  outline: none;
}

.recent-image {
  flex: 0 0 48px;
  width: 48px;
  height: 48px;
  border-radius: 6px;
  overflow: hidden;
  background: #101d17;
  flex-shrink: 0;
}

.recent-photo {
  width: 100%;
  height: 100%;
}

.recent-image-default {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4a7a5e;
  background: rgba(66, 184, 131, 0.07);
}

.recent-body {
  flex: 1;
  min-width: 0;
}

.recent-name-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 4px;
}

.recent-name {
  font-size: 13px;
  font-weight: 600;
  color: #e7f8ee;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.recent-time {
  font-size: 11px;
  color: #5a7a68;
  flex-shrink: 0;
}

.recent-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.recent-price {
  font-size: 12px;
  color: #7aab8c;
}
</style>
