<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  products: {
    type: Array,
    default: () => [],
  },
  mode: {
    type: String,
    default: 'grid',
    validator: (value) => ['grid', 'list'].includes(value),
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const isGrid = computed(() => props.mode === 'grid')
const failedImageIds = ref(new Set())
const router = useRouter()

function formatPrice(value) {
  const amount = Number(value || 0)

  return `RM ${amount.toFixed(2)}`
}

function formatType(value) {
  if (!value) return 'Uncategorized'

  return value
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function hasDisplayImage(product) {
  return product.image_url && !failedImageIds.value.has(product.id)
}

function onImageError(product) {
  failedImageIds.value = new Set([...failedImageIds.value, product.id])
}

function openProduct(product) {
  router.push(`/dashboard/products/${product.id}`)
}
</script>

<template>
  <div>
    <div v-if="loading" :class="isGrid ? 'products-grid' : 'products-list'">
      <v-skeleton-loader
        v-for="index in isGrid ? 8 : 5"
        :key="index"
        class="product-skeleton"
        type="image, article"
      />
    </div>

    <v-alert
      v-else-if="products.length === 0"
      type="info"
      variant="tonal"
      color="warning"
      class="empty-state"
    >
      No products found. Create your first product to start building your catalogue.
    </v-alert>

    <div v-else :class="isGrid ? 'products-grid' : 'products-list'">
      <article
        v-for="product in products"
        :key="product.id"
        class="product-card"
        role="button"
        tabindex="0"
        @click="openProduct(product)"
        @keydown.enter.prevent="openProduct(product)"
        @keydown.space.prevent="openProduct(product)"
      >
        <div :class="isGrid ? 'product-image product-image-grid' : 'product-image'">
          <v-img
            v-if="hasDisplayImage(product)"
            :src="product.image_url"
            :alt="product.name"
            cover
            class="product-photo"
            @error="onImageError(product)"
          />
          <div v-else class="product-image-default">
            <v-icon icon="mdi-image-off-outline" size="38" />
          </div>
        </div>

        <div class="product-body">
          <div class="product-heading-row">
            <h2 class="product-title">{{ product.name }}</h2>
            <v-chip size="small" color="primary" variant="tonal">
              {{ formatType(product.type) }}
            </v-chip>
          </div>

          <p class="product-description">
            {{ product.descriptions || 'No description provided.' }}
          </p>

          <div class="product-meta">
            <span>
              <v-icon icon="mdi-cash" size="18" />
              {{ formatPrice(product.price) }}
            </span>
            <span>
              <v-icon icon="mdi-package-variant-closed" size="18" />
              {{ product.value }} pc
            </span>
          </div>
        </div>
      </article>
    </div>
  </div>
</template>

<style scoped>
.products-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
}

.products-list {
  display: grid;
  gap: 12px;
}

.product-card {
  display: flex;
  gap: 16px;
  min-width: 0;
  overflow: hidden;
  border: 1px solid rgba(66, 184, 131, 0.18);
  border-radius: 8px;
  background: #0d1511;
  box-shadow: 0 18px 42px rgba(0, 0, 0, 0.24);
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.product-card:hover,
.product-card:focus-visible {
  border-color: rgba(66, 184, 131, 0.55);
  box-shadow: 0 20px 48px rgba(0, 0, 0, 0.34);
  transform: translateY(-2px);
  outline: none;
}

.products-grid .product-card {
  flex-direction: column;
}

.product-image {
  flex: 0 0 148px;
  width: 148px;
  min-height: 132px;
  background: #101d17;
}

.product-image-grid {
  width: 100%;
  aspect-ratio: 4 / 3;
  min-height: 0;
}

.product-photo,
.product-image-default {
  width: 100%;
  height: 100%;
}

.product-image-default {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #76c8a4;
  background: linear-gradient(135deg, rgba(66, 184, 131, 0.14), rgba(53, 73, 94, 0.16)), #0b110e;
}

.product-body {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  padding: 16px;
}

.product-heading-row {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 12px;
  min-width: 0;
}

.product-title {
  min-width: 0;
  color: #e8f7ee;
  font-size: 18px;
  font-weight: 700;
  line-height: 1.25;
  overflow-wrap: anywhere;
}

.product-description {
  display: -webkit-box;
  margin-top: 10px;
  color: #aebcb4;
  font-size: 14px;
  line-height: 1.5;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
}

.products-list .product-description {
  -webkit-line-clamp: 1;
  line-clamp: 1;
}

.product-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 28px;
  margin-top: auto;
  padding-top: 14px;
  color: #d7eadf;
  font-size: 14px;
}

.product-meta span {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.product-skeleton {
  border-radius: 8px;
  background: #0d1511;
}

.empty-state {
  border: 1px solid rgba(66, 184, 131, 0.2);
}

@media (max-width: 1200px) {
  .products-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 820px) {
  .products-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .product-card {
    flex-direction: column;
  }

  .product-image {
    width: 100%;
    aspect-ratio: 4 / 3;
    min-height: 0;
  }
}

@media (max-width: 560px) {
  .products-grid {
    grid-template-columns: 1fr;
  }
}
</style>
