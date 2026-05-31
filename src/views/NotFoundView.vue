<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function goHome() {
  router.push('/')
}
</script>

<template>
  <v-container fluid class="not-found-page fill-height d-flex align-center justify-center">
    <div class="content text-center">
      <v-icon icon="mdi-alert-circle-outline" size="120" color="primary" class="mb-6" />

      <h1 class="error-code">404</h1>

      <h2 class="error-title">Page Not Found</h2>

      <p class="error-description">The URL you entered does not exist or may have been moved.</p>

      <v-btn color="primary" size="x-large" rounded="md" prepend-icon="mdi-home" @click="goHome">
        Back to Home
      </v-btn>
    </div>
  </v-container>
</template>

<style scoped>
.not-found-page {
  background: #101613;
}

.content {
  max-width: 600px;
}

.error-code {
  font-size: 7rem;
  font-weight: 800;
  line-height: 1;
  color: #42b883;
  margin-bottom: 1rem;
}

.error-title {
  font-size: 2rem;
  font-weight: 700;
  color: white;
  margin-bottom: 1rem;
}

.error-description {
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.05rem;
  margin-bottom: 2rem;
}
</style>
