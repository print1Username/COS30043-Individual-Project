<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import AppButton from '@/components/ui/AppButton.vue'
import Pagination from '@/components/ui/Pagination.vue'
import ProductsTable from '@/components/ProductsTable.vue'
import { getProducts } from '@/lib/products'

const products = ref([])
const loading = ref(false)
const errorMessage = ref('')
const viewMode = ref('grid')
const page = ref(1)
const totalProducts = ref(0)

const perPage = computed(() => (viewMode.value === 'grid' ? 16 : 10))
const totalPages = computed(() => Math.max(Math.ceil(totalProducts.value / perPage.value), 1))
const resultSummary = computed(() => {
  if (totalProducts.value === 0) return '0 products'

  const start = (page.value - 1) * perPage.value + 1
  const end = Math.min(page.value * perPage.value, totalProducts.value)
  return `${start}-${end} of ${totalProducts.value} products`
})

async function loadProducts() {
  loading.value = true
  errorMessage.value = ''

  try {
    const result = await getProducts({
      page: page.value,
      perPage: perPage.value,
    })

    products.value = result.products
    totalProducts.value = result.total

    if (page.value > totalPages.value) {
      page.value = totalPages.value
    }
  } catch (error) {
    console.error('[products:list]', error)
    errorMessage.value = error?.message || 'Unable to load products.'
    products.value = []
    totalProducts.value = 0
  } finally {
    loading.value = false
  }
}

function setViewMode(mode) {
  if (viewMode.value === mode) return

  viewMode.value = mode
  page.value = 1
}

watch([page, perPage], () => {
  loadProducts()
})

onMounted(() => {
  loadProducts()
})
</script>

<template>
  <v-container fluid class="products-page">
    <section class="products-shell">
      <header class="products-header">
        <div class="products-heading">
          <p class="text-overline text-primary mb-2">Products</p>
          <h1 class="text-h3 font-weight-bold mb-3">My Products</h1>
          <p class="text-body-1 products-description">
            View every product you have created, check its basic details, and jump back into
            catalogue work quickly.
          </p>
        </div>

        <div class="products-actions">
          <v-btn-toggle
            :model-value="viewMode"
            mandatory
            divided
            class="view-toggle"
            color="primary"
            @update:model-value="setViewMode"
          >
            <v-btn value="grid" aria-label="Grid view">
              <v-icon icon="mdi-view-grid-outline" />
            </v-btn>
            <v-btn value="list" aria-label="List view">
              <v-icon icon="mdi-format-list-bulleted" />
            </v-btn>
          </v-btn-toggle>

          <AppButton
            text="Create Product"
            to="/dashboard/products/create"
            color="primary"
            variant="flat"
            rounded="md"
            icon="mdi-plus"
            class="pa-4 ml-6"
            icon-type="prepend"
          />
        </div>
      </header>

      <v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-5">
        {{ errorMessage }}
      </v-alert>

      <div class="products-summary">
        <span>{{ resultSummary }}</span>
        <span>{{ viewMode === 'grid' ? '16 per page' : '10 per page' }}</span>
      </div>

      <ProductsTable :products="products" :mode="viewMode" :loading="loading" />

      <Pagination
        v-if="totalProducts > perPage"
        v-model="page"
        :total-pages="totalPages"
        :disabled="loading"
        class="mt-8"
      />
    </section>
  </v-container>
</template>

<style scoped>
.products-page {
  min-height: 100vh;
  padding: 104px 32px 40px;
  background:
    radial-gradient(circle at top left, rgba(66, 184, 131, 0.14), transparent 36%), #050806;
}

.products-shell {
  max-width: 1280px;
  width: 100%;
  margin: 0 auto;
}

.products-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 26px;
}

.products-heading {
  max-width: 620px;
}

.products-heading h1 {
  color: #e7f8ee;
}

.products-description {
  color: #bdc9c0;
}

.products-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.view-toggle {
  overflow: hidden;
  border: 1px solid rgba(66, 184, 131, 0.25);
  background: #0c130f;
  border-radius: 8px;
}

.products-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;
  color: #9fb3a7;
  font-size: 14px;
}

@media (max-width: 760px) {
  .products-page {
    padding: 92px 18px 32px;
  }

  .products-header,
  .products-actions,
  .products-summary {
    align-items: stretch;
    flex-direction: column;
  }

  .products-actions {
    width: 100%;
  }

  .view-toggle {
    align-self: flex-start;
  }
}
</style>
