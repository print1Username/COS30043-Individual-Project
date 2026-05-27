<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { handleLogout } from '@/lib/auth'

const router = useRouter()
const isLoggingOut = ref(false)

const handleLogoutClick = async () => {
  isLoggingOut.value = true
  try {
    await handleLogout()
    router.push('/login')
  } catch (error) {
    console.error('[logout] Error:', error)
    isLoggingOut.value = false
  }
}
</script>

<template>
  <v-btn
    prepend-icon="mdi-logout"
    text="Logout"
    variant="tonal"
    color="#ef5350"
    size="small"
    class="logout-button"
    :loading="isLoggingOut"
    @click="handleLogoutClick"
  />
</template>

<style scoped>
.logout-button {
  font-weight: 500;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-size: 18px;
  margin-left: 8px;
  border-left: 1px solid rgba(255, 255, 255, 0.2);
  /* larger horizontal padding than other buttons */
  padding: 32px 32px !important;
  transition: all 0.2s ease;
  background-color: rgba(239, 83, 80, 0.1) !important;
}

.logout-button:hover {
  transform: translateY(-2px);
  background-color: rgba(239, 83, 80, 0.2) !important;
}

/* Active state with more visible red */
:deep(.v-btn__content) {
  color: #ef5350 !important;
}
</style>
