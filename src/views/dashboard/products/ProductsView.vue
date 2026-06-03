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
            Marketplace
          </v-tab>
          <v-tab value="my" class="tab-item">
            <v-icon icon="mdi-folder-outline" class="me-2" />
            My Products
          </v-tab>
        </v-tabs>

        <div class="products-legend">
          <div class="legend-item">
            <span class="legend-dot other"></span>
            Community Product
          </div>

          <div class="legend-item">
            <span class="legend-dot own"></span>
            Your Product
          </div>
        </div>
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
.product-card-own {
  border: 2px solid rgba(66, 184, 131, 0.6);

  background: linear-gradient(135deg, rgba(66, 184, 131, 0.12), rgba(66, 184, 131, 0.04));
}

.product-card-other {
  border: 1px solid rgba(100, 181, 246, 0.18);

  background: rgba(12, 16, 14, 0.9);
}

.products-legend {
  display: flex;
  gap: 20px;
  margin: 24px;
  color: #9fb3a7;
  font-size: 13px;
  border: 2px solid transparent;
  border-color: #296647;
  border-radius: 5px;
  padding: 8px 16px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
}

.legend-dot.own {
  background: #42b883;
}

.legend-dot.other {
  background: #64b5f6;
}
</style>
