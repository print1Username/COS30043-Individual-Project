<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppButton from '@/components/ui/AppButton.vue'
import ImageGallery from '@/components/ImageGallery.vue'
import { getAnyProductById } from '@/lib/products'

const route = useRoute()
const router = useRouter()

const product = ref(null)
const loading = ref(false)
const errorMessage = ref('')

const productTypes = [
  { label: 'Food & Beverage', value: 'food_and_beverage' },
  { label: 'Tools & Equipment', value: 'tools_and_equipment' },
  { label: 'Furniture & Home Goods', value: 'furniture_and_home_goods' },
  { label: 'Clothing & Wearables', value: 'clothing_and_wearables' },
  { label: 'Raw Materials', value: 'raw_materials' },
  { label: 'Components & Parts', value: 'components_and_parts' },
  { label: 'Structures', value: 'structures' },
  { label: 'Entertainment & Hobby', value: 'entertainment_and_hobby' },
  { label: 'Medical & Health', value: 'medical_and_health' },
  { label: 'Personal Care & Cosmetics', value: 'personal_care_and_cosmetics' },
  { label: 'Containers & Storage', value: 'containers_and_storage' },
]

const productId = route.params.id

function formatDate(value) {
  if (!value) return 'Not available'
  return new Intl.DateTimeFormat('en-MY', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function formatType(value) {
  return productTypes.find((item) => item.value === value)?.label || 'Uncategorized'
}

function formatPrice(price) {
  return `RM ${Number(price || 0).toFixed(2)}`
}

async function loadProduct() {
  loading.value = true
  errorMessage.value = ''

  try {
    const data = await getAnyProductById(productId)
    product.value = data
  } catch (error) {
    console.error('[products:view] load error', error)
    errorMessage.value = error?.message || 'Unable to load this product.'
    product.value = null
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadProduct()
})
</script>

<template>
  <v-container fluid class="product-view-page">
    <section class="view-shell">
      <!-- Header -->
      <header class="view-header">
        <div class="header-title-group">
          <AppButton
            iconType="icon"
            icon="mdi-arrow-left"
            to="/dashboard/products"
            color="primary"
            variant="tonal"
            rounded="md"
            aria-label="Back to products"
          />
          <div>
            <p class="text-overline text-primary mb-1">View Product</p>
            <h1 class="text-h4 font-weight-bold">Product Details</h1>
          </div>
        </div>
      </header>

      <v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-4">
        {{ errorMessage }}
      </v-alert>

      <v-skeleton-loader v-if="loading" type="image, article, actions" class="view-loader" />

      <v-alert v-else-if="!product" type="warning" variant="tonal">
        Product not found, or you do not have permission to view it.
      </v-alert>

      <div v-else class="view-grid">
        <!-- Left Side: Image Gallery -->
        <section class="gallery-panel">
          <ImageGallery
            :images="product.image_urls?.map((url) => ({ url })) || []"
            :product-name="product.name"
          />
        </section>

        <!-- Right Side: Product Information -->
        <section class="info-panel">
          <div class="info-container">
            <!-- Product Name -->
            <div class="info-section">
              <h2 class="info-heading">{{ product.name }}</h2>
            </div>

            <!-- Price and Value -->
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Price</span>
                <p class="info-value">{{ formatPrice(product.price) }}</p>
              </div>
              <div class="info-item">
                <span class="info-label">Quantity</span>
                <p class="info-value">{{ product.value || 1 }} pc</p>
              </div>
            </div>

            <!-- Description -->
            <div class="info-section">
              <span class="info-label">Description</span>
              <p class="info-description">
                {{ product.descriptions || 'No description provided.' }}
              </p>
            </div>

            <!-- Product Type -->
            <div class="info-section">
              <span class="info-label">Product Type</span>
              <div class="type-badge">{{ formatType(product.type) }}</div>
            </div>

            <!-- Dates -->
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Created</span>
                <p class="info-date">{{ formatDate(product.created_at) }}</p>
              </div>
              <div class="info-item">
                <span class="info-label">Updated</span>
                <p class="info-date">{{ formatDate(product.update_at) }}</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </section>
  </v-container>
</template>

<style scoped>
.product-view-page {
  min-height: 100vh;
  padding: 104px 32px 96px;
  background:
    radial-gradient(circle at top left, rgba(66, 184, 131, 0.14), transparent 34%), #050806;
  color: #e7f8ee;
}

.view-shell {
  width: 100%;
  max-width: 1180px;
  margin: 0 auto;
}

.view-header {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-bottom: 24px;
}

.header-title-group {
  display: flex;
  align-items: center;
  gap: 14px;
}

.view-grid {
  display: grid;
  grid-template-columns: minmax(300px, 0.82fr) minmax(0, 1.18fr);
  gap: 22px;
}

.gallery-panel,
.info-panel,
.view-loader {
  border: 1px solid rgba(66, 184, 131, 0.18);
  border-radius: 8px;
  background: #0d1511;
  box-shadow: 0 18px 42px rgba(0, 0, 0, 0.24);
}

.gallery-panel,
.info-panel {
  padding: 20px;
  min-height: 400px;
  display: flex;
  flex-direction: column;
}

.view-loader {
  grid-column: 1 / -1;
}

/* Info Panel */
.info-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
  height: 100%;
}

.info-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-heading {
  font-size: 24px;
  font-weight: 700;
  color: #e7f8ee;
  margin: 0;
}

.info-label {
  font-size: 12px;
  font-weight: 600;
  color: #42b883;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value,
.info-date {
  font-size: 15px;
  color: #e7f8ee;
  margin: 0;
  line-height: 1.6;
}

.info-description {
  font-size: 14px;
  color: #c9d9cd;
  margin: 0;
  line-height: 1.8;
  white-space: pre-wrap;
  word-break: break-word;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px;
  background: rgba(66, 184, 131, 0.03);
  border: 1px solid rgba(66, 184, 131, 0.12);
  border-radius: 6px;
}

.type-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(66, 184, 131, 0.12);
  border: 1px solid rgba(66, 184, 131, 0.25);
  border-radius: 20px;
  color: #42b883;
  font-size: 13px;
  font-weight: 500;
  width: fit-content;
}

/* Responsive */
@media (max-width: 960px) {
  .view-grid {
    grid-template-columns: 1fr;
  }

  .gallery-panel {
    min-height: 300px;
  }
}

@media (max-width: 600px) {
  .product-view-page {
    padding: 80px 16px 64px;
  }

  .view-shell {
    max-width: 100%;
  }

  .view-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .header-title-group {
    width: 100%;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .gallery-panel,
  .info-panel {
    padding: 16px;
    min-height: auto;
  }

  .info-heading {
    font-size: 20px;
  }
}
</style>
