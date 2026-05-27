<script setup>
import AppButton from '@/components/ui/AppButton.vue'
</script>

<template>
  <v-container fluid class="dashboard-page">
    <section class="dashboard-content">
      <p class="text-overline text-primary mb-2">Settings</p>
      <h1 class="text-h3 font-weight-bold mb-4">Account Settings</h1>
      <p class="text-body-1 text-medium-emphasis mb-6">
        Manage your account preferences and settings.
      </p>
      <AppButton
        text="Back to Dashboard"
        to="/dashboard"
        color="primary"
        size="large"
        rounded="md"
      />
    </section>
  </v-container>
</template>

<style scoped>
.dashboard-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.dashboard-content {
  max-width: 800px;
  width: 100%;
  text-align: center;
}
</style>
