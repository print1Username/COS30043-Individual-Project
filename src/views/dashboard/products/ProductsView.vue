<script setup>
import { ref } from 'vue'
import ProductsSearchView from './ProductsSearchView.vue'
import MyProductsView from './MyProductsView.vue'

const activeTab = ref('all')
</script>

<template>
  <v-container fluid class="products-page">
    <section class="products-shell">
      <!-- Tab Selection -->
      <div class="products-tabs">
        <v-tabs v-model="activeTab" color="primary" class="tabs-header">
          <v-tab value="all" class="tab-item">
            <v-icon icon="mdi-store-outline" class="me-2" />
            All Products
          </v-tab>
          <v-tab value="my" class="tab-item">
            <v-icon icon="mdi-folder-outline" class="me-2" />
            My Products
          </v-tab>
        </v-tabs>
      </div>

      <!-- Tab Content -->
      <v-window v-model="activeTab" class="tab-content">
        <v-window-item value="all">
          <ProductsSearchView />
        </v-window-item>

        <v-window-item value="my">
          <MyProductsView />
        </v-window-item>
      </v-window>
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

.products-tabs {
  margin-bottom: 32px;
}

.tabs-header {
  border-bottom: 1px solid rgba(66, 184, 131, 0.18);
  background: transparent;
}

.tab-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 24px;
  color: #9fb3a7;
  font-weight: 500;
}

.tab-content {
  padding: 0;
}

@media (max-width: 760px) {
  .products-page {
    padding: 92px 18px 32px;
  }

  .tab-item {
    padding: 0 16px;
    font-size: 12px;
  }

  .tab-item :deep(.v-icon) {
    font-size: 18px;
  }
}
</style>
