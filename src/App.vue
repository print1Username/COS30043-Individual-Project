<script setup>
import { RouterView, useRoute } from 'vue-router'
import NavigationBar from '@/components/NavigationBar.vue'

const route = useRoute()

// Show navigation bar only on /home routes
const showNavBar = () => {
  return route.path.startsWith('/home')
}
</script>

<template>
  <v-app>
    <NavigationBar v-if="showNavBar()" />
    <RouterView />
  </v-app>
</template>
