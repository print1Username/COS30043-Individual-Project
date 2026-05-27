<script setup>
import { RouterView, useRoute } from 'vue-router'
import NavigationBar from '@/components/NavigationBar.vue'

const route = useRoute()

// Show navigation bar only on dashboard routes
const showNavBar = () => {
  return route.path.startsWith('/dashboard')
}
</script>

<template>
  <v-app>
    <NavigationBar v-if="showNavBar()" />
    <RouterView />
  </v-app>
</template>
