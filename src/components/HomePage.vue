<script setup>
import AppButton from './ui/AppButton.vue'
</script>

<template>
  <v-container fluid class="home-page">
    <div class="home-content text-center">
      <!-- Logo -->
      <img alt="Vue logo" class="logo mb-6" src="@/assets/logo.svg" width="125" height="125" />

      <!-- Title -->
      <h1 class="text-h3 font-weight-bold mb-4">Vue E-Commerce</h1>

      <!-- Description -->
      <h3 class="text-subtitle-1 text-medium-emphasis mb-6">
        This is a simple e-commerce website built with Vue.js. It demonstrates the use of Vue Router
        for navigation and component-based architecture for building a scalable application.
      </h3>
      <!-- Buttons -->
      <div class="home-actions">
        <AppButton text="Login" to="/login" />
        <AppButton text="Sign Up" to="/signup" variant="outlined" />
      </div>
    </div>
  </v-container>
</template>

<style scoped>
.home-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 24px;
}

.home-content {
  width: 100%;
  max-width: 680px;
  margin-inline: auto;
}

.logo {
  display: block;
  margin-inline: auto;
}

.home-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 16px;
}
</style>
