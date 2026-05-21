<script setup>
import AppButton from '@/components/ui/AppButton.vue'
</script>

<template>
  <v-container fluid class="dashboard-page">
    <section class="dashboard-content">
      <p class="text-overline text-primary mb-2">Dashboard</p>
      <h1 class="text-h3 font-weight-bold mb-4">Home</h1>
      <p class="text-body-1 text-medium-emphasis mb-6">
        You are signed in. This page is protected by the Supabase session guard.
      </p>
      <AppButton text="Continue shopping" to="/" color="primary" size="large" rounded="md" />
    </section>
  </v-container>
</template>

<style scoped>
.dashboard-page {
  min-height: 100vh;
  padding: 48px 24px;
}

.dashboard-content {
  width: 100%;
  max-width: 960px;
  margin-inline: auto;
}
</style>
