<script setup>
import WeeklyProductChart from '@/components/WeeklyProductChart.vue'
import QuickActions from '@/components/QuickActions.vue'
import RecentOtherProducts from '@/components/RecentOtherProducts.vue'
</script>

<template>
  <v-container fluid class="home-page">
    <section class="home-shell">
      <header class="home-header mb-6">
        <p class="text-overline text-primary mb-1">Dashboard</p>
        <h1 class="home-title">Home</h1>
      </header>

      <div class="home-grid">
        <!-- Left column: chart (top) + quick actions (bottom) -->
        <div class="left-col">
          <WeeklyProductChart class="mb-4" />
          <QuickActions />
        </div>

        <!-- Right column: recent other users products -->
        <div class="right-col">
          <RecentOtherProducts />
        </div>
      </div>
    </section>
  </v-container>
</template>

<style scoped>
.home-page {
  min-height: 100vh;
  padding: 104px 32px 48px;
  background:
    radial-gradient(circle at top left, rgba(66, 184, 131, 0.13), transparent 36%), #050806;
}

.home-shell {
  max-width: 1280px;
  width: 100%;
  margin: 0 auto;
}

.home-title {
  font-size: 2rem;
  font-weight: 700;
  color: #e7f8ee;
}

.home-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
  align-items: start;
}

.left-col {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.right-col {
  min-width: 0;
}

@media (max-width: 960px) {
  .home-page {
    padding: 92px 18px 40px;
  }

  .home-grid {
    grid-template-columns: 1fr;
  }
}
</style>
