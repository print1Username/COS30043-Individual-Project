<script setup>
import AppButton from './ui/AppButton.vue'
</script>

<template>
  <v-container class="fill-height d-flex align-center justify-center">
    <v-row align="center" justify="center">
      <v-col cols="12" md="8" lg="6" class="text-center">
        <!-- Logo -->
        <img alt="Vue logo" class="logo mb-6" src="@/assets/logo.svg" width="125" height="125" />

        <!-- Title -->
        <h1 class="text-h3 font-weight-bold mb-4">Vue E-Commerce</h1>

        <!-- Description -->
        <h3 class="text-subtitle-1 text-medium-emphasis mb-8">
          This is a simple e-commerce website built with Vue.js. It demonstrates the use of Vue
          Router for navigation and component-based architecture for building a scalable
          application.
        </h3>

        <!-- Buttons -->
        <div class="d-flex justify-center ga-4">
          <AppButton text="Login" to="/login" />
          <AppButton text="Sign Up" to="/signup" variant="outlined" />
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.logo {
  display: block;
  margin-inline: auto;
}
</style>
