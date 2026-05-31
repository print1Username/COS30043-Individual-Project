<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { searchOwnProducts, searchOtherProducts, formatProductType } from '@/lib/search'

const route = useRoute()
const router = useRouter()

const query = ref(route.query.q || '')
const tab = ref('others')
const loadingOwn = ref(false)
const loadingOthers = ref(false)
const ownProducts = ref([])
const otherProducts = ref([])
const errorOwn = ref('')
const errorOthers = ref('')

const hasQuery = computed(() => !!query.value.trim())

// Cancel token: incremented on every new search; stale promises check against it
let searchToken = 0

async function runSearch(q) {
  if (!q || !q.trim()) {
    ownProducts.value = []
    otherProducts.value = []
    return
  }

  // Invalidate any in-flight search from a previous call
  const token = ++searchToken

  errorOwn.value = ''
  errorOthers.value = ''
  loadingOwn.value = true
  loadingOthers.value = true

  searchOwnProducts(q)
    .then((results) => {
      if (token !== searchToken) return // stale — a newer search has started
      ownProducts.value = results
    })
    .catch((err) => {
      if (token !== searchToken) return
      console.error('[search:own]', err)
      errorOwn.value = err?.message || 'Failed to search your products.'
    })
    .finally(() => {
      if (token !== searchToken) return
      loadingOwn.value = false
    })

  searchOtherProducts(q)
    .then((results) => {
      if (token !== searchToken) return
      otherProducts.value = results
    })
    .catch((err) => {
      if (token !== searchToken) return
      console.error('[search:others]', err)
      errorOthers.value = err?.message || 'Failed to search other products.'
    })
    .finally(() => {
      if (token !== searchToken) return
      loadingOthers.value = false
    })
}

function submitSearch() {
  const q = query.value.trim()
  if (!q) return
  router.replace({ path: '/dashboard/search', query: { q } })
}

// Single source of truth: immediate watch covers both initial load and subsequent navigation
watch(
  () => route.query.q,
  (q) => {
    query.value = q || ''
    runSearch(q)
  },
  { immediate: true },
)

function formatPrice(value) {
  return `RM ${Number(value || 0).toFixed(2)}`
}
</script>

<template>
  <v-container fluid class="search-page">
    <section class="search-shell">
      <!-- Page header -->
      <header class="search-header mb-6">
        <div>
          <p class="text-overline text-primary mb-1">Search</p>
          <h1 class="text-h4 font-weight-bold search-title">
            {{ hasQuery ? `Results for "${route.query.q}"` : 'Search Products' }}
          </h1>
        </div>
      </header>

      <!-- Inline search bar -->
      <div class="search-bar-row mb-6">
        <v-text-field
          v-model="query"
          placeholder="Search by name or description..."
          variant="outlined"
          density="comfortable"
          color="primary"
          hide-details
          class="search-field"
          prepend-inner-icon="mdi-magnify"
          clearable
          @keydown.enter="submitSearch"
          @click:clear="query = ''"
        />
        <v-btn
          color="primary"
          variant="flat"
          size="large"
          rounded="md"
          class="ml-3 search-btn"
          @click="submitSearch"
        >
          Search
        </v-btn>
      </div>

      <!-- Empty state: no query -->
      <div v-if="!hasQuery" class="empty-query">
        <v-icon icon="mdi-magnify" size="80" color="#35495e" class="mb-4" />
        <h3 class="text-h5 font-weight-bold mb-2">Start Searching</h3>
        <p class="text-body-1 text-medium-emphasis">
          Enter a product name or description above to find items.
        </p>
      </div>

      <!-- Tabs -->
      <template v-else>
        <v-tabs v-model="tab" color="primary" class="search-tabs mb-4">
          <v-tab value="others">
            <v-icon start icon="mdi-store-outline" />
            Other Users
            <v-chip
              v-if="!loadingOthers"
              size="x-small"
              class="ml-2"
              color="primary"
              variant="tonal"
            >
              {{ otherProducts.length }}
            </v-chip>
          </v-tab>
          <v-tab value="own">
            <v-icon start icon="mdi-package-variant" />
            My Products
            <v-chip v-if="!loadingOwn" size="x-small" class="ml-2" color="primary" variant="tonal">
              {{ ownProducts.length }}
            </v-chip>
          </v-tab>
        </v-tabs>

        <v-window v-model="tab">
          <!-- Other users tab -->
          <v-window-item value="others">
            <div v-if="loadingOthers" class="loading-state">
              <v-progress-circular indeterminate color="primary" size="48" />
            </div>
            <v-alert v-else-if="errorOthers" type="error" variant="tonal" class="mb-4">
              {{ errorOthers }}
            </v-alert>
            <div v-else-if="otherProducts.length === 0" class="empty-results">
              <v-icon icon="mdi-store-off-outline" size="64" color="#35495e" class="mb-3" />
              <p class="text-body-1 text-medium-emphasis">
                No products from other users match "{{ route.query.q }}".
              </p>
            </div>
            <div v-else class="results-grid">
              <article v-for="product in otherProducts" :key="product.id" class="result-card">
                <div class="result-image">
                  <v-img
                    v-if="product.image_url"
                    :src="product.image_url"
                    :alt="product.name"
                    cover
                    class="result-photo"
                  />
                  <div v-else class="result-image-default">
                    <v-icon icon="mdi-image-off-outline" size="32" />
                  </div>
                </div>
                <div class="result-body">
                  <div class="result-top-row">
                    <h3 class="result-name">{{ product.name }}</h3>
                    <v-chip size="small" color="primary" variant="tonal" class="shrink-0">
                      {{ formatProductType(product.type) }}
                    </v-chip>
                  </div>
                  <p class="result-desc">
                    {{ product.descriptions || 'No description provided.' }}
                  </p>
                  <div class="result-meta">
                    <span>
                      <v-icon icon="mdi-cash" size="16" />
                      {{ formatPrice(product.price) }}
                    </span>
                    <span>
                      <v-icon icon="mdi-package-variant-closed" size="16" />
                      {{ product.value }} pc
                    </span>
                  </div>
                </div>
              </article>
            </div>
          </v-window-item>

          <!-- Own products tab -->
          <v-window-item value="own">
            <div v-if="loadingOwn" class="loading-state">
              <v-progress-circular indeterminate color="primary" size="48" />
            </div>
            <v-alert v-else-if="errorOwn" type="error" variant="tonal" class="mb-4">
              {{ errorOwn }}
            </v-alert>
            <div v-else-if="ownProducts.length === 0" class="empty-results">
              <v-icon
                icon="mdi-package-variant-closed-remove"
                size="64"
                color="#35495e"
                class="mb-3"
              />
              <p class="text-body-1 text-medium-emphasis">
                None of your products match "{{ route.query.q }}".
              </p>
            </div>
            <div v-else class="results-grid">
              <article
                v-for="product in ownProducts"
                :key="product.id"
                class="result-card result-card--own"
                role="button"
                tabindex="0"
                @click="$router.push(`/dashboard/products/${product.id}`)"
                @keydown.enter.prevent="$router.push(`/dashboard/products/${product.id}`)"
              >
                <div class="result-image">
                  <v-img
                    v-if="product.image_url"
                    :src="product.image_url"
                    :alt="product.name"
                    cover
                    class="result-photo"
                  />
                  <div v-else class="result-image-default">
                    <v-icon icon="mdi-image-off-outline" size="32" />
                  </div>
                </div>
                <div class="result-body">
                  <div class="result-top-row">
                    <h3 class="result-name">{{ product.name }}</h3>
                    <v-chip size="small" color="primary" variant="tonal" class="shrink-0">
                      {{ formatProductType(product.type) }}
                    </v-chip>
                  </div>
                  <p class="result-desc">
                    {{ product.descriptions || 'No description provided.' }}
                  </p>
                  <div class="result-meta">
                    <span>
                      <v-icon icon="mdi-cash" size="16" />
                      {{ formatPrice(product.price) }}
                    </span>
                    <span>
                      <v-icon icon="mdi-package-variant-closed" size="16" />
                      {{ product.value }} pc
                    </span>
                    <v-chip size="x-small" color="success" variant="tonal">
                      <v-icon start icon="mdi-check-circle" size="12" />
                      Mine
                    </v-chip>
                  </div>
                </div>
              </article>
            </div>
          </v-window-item>
        </v-window>
      </template>
    </section>
  </v-container>
</template>

<style scoped>
.search-page {
  min-height: 100vh;
  padding: 104px 32px 48px;
  background:
    radial-gradient(circle at top left, rgba(66, 184, 131, 0.13), transparent 36%), #050806;
  color: #e7f8ee;
}

.search-shell {
  max-width: 1100px;
  width: 100%;
  margin: 0 auto;
}

.search-title {
  color: #e7f8ee;
}

.search-bar-row {
  display: flex;
  align-items: center;
}

.search-field {
  flex: 1;
}

.search-btn {
  min-width: 110px;
}

.search-tabs {
  border-bottom: 1px solid rgba(66, 184, 131, 0.18);
}

.loading-state {
  display: flex;
  justify-content: center;
  padding: 60px 0;
}

.empty-query,
.empty-results {
  text-align: center;
  padding: 60px 24px;
  background: #0c130f;
  border: 1px dashed rgba(66, 184, 131, 0.2);
  border-radius: 12px;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.result-card {
  display: flex;
  gap: 14px;
  border: 1px solid rgba(66, 184, 131, 0.16);
  border-radius: 8px;
  background: #0d1511;
  overflow: hidden;
  transition:
    border-color 0.2s,
    transform 0.2s;
}

.result-card--own {
  cursor: pointer;
}

.result-card--own:hover,
.result-card--own:focus-visible {
  border-color: rgba(66, 184, 131, 0.5);
  transform: translateY(-2px);
  outline: none;
}

.result-image {
  flex: 0 0 110px;
  width: 110px;
  min-height: 110px;
  background: #101d17;
}

.result-photo {
  width: 100%;
  height: 100%;
}

.result-image-default {
  width: 100%;
  height: 100%;
  min-height: 110px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #76c8a4;
  background: linear-gradient(135deg, rgba(66, 184, 131, 0.12), rgba(53, 73, 94, 0.14)), #0b110e;
}

.result-body {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  padding: 14px 14px 14px 0;
}

.result-top-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 6px;
}

.result-name {
  color: #e8f7ee;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.3;
  overflow-wrap: anywhere;
}

.result-desc {
  color: #aebcb4;
  font-size: 13px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
}

.result-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 10px;
  color: #d7eadf;
  font-size: 13px;
}

.result-meta span {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

@media (max-width: 820px) {
  .search-page {
    padding: 92px 18px 40px;
  }

  .results-grid {
    grid-template-columns: 1fr;
  }

  .search-btn {
    min-width: 80px;
  }
}
</style>
