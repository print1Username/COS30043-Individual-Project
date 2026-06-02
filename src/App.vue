<script setup>
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import { useDisplay } from 'vuetify'

import NavigationBar from '@/components/NavigationBar.vue'
import NavigationBarMobile from '@/components/NavigationBarMobile.vue'

const route = useRoute()

const { mdAndDown } = useDisplay()

const showNavBar = computed(() => {
  return route.path.startsWith('/dashboard')
})
</script>

<template>
  <v-app>
    <template v-if="showNavBar">
      <NavigationBarMobile v-if="mdAndDown" />
      <NavigationBar v-else />
    </template>

    <RouterView />
  </v-app>
</template>
