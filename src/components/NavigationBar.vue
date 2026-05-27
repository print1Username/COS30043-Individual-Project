<script setup>
import { useRouter } from 'vue-router'
import AppButton from '@/components/ui/AppButton.vue'
import LogoutButton from '@/components/ui/LogoutButton.vue'

const router = useRouter()

const navItems = [
  {
    label: 'Dashboard',
    icon: 'mdi-home-dashboard',
    to: '/dashboard',
  },
  {
    label: 'Orders',
    icon: 'mdi-package-multiple',
    to: '/dashboard/orders',
  },
  {
    label: 'Settings',
    icon: 'mdi-cog',
    to: '/dashboard/settings',
  },
  {
    label: 'Profile',
    icon: 'mdi-account-circle',
    to: '/dashboard/profile',
  },
]

const isActive = (path) => {
  return router.currentRoute.value.path === path
}
</script>

<template>
  <v-app-bar color="#1a1a1a" class="navbar-container" elevation="4">
    <!-- Brand/Logo Section -->
    <div class="navbar-brand">
      <v-icon icon="mdi-vuejs" size="large" color="#42b883" class="mr-2" />
      <span class="brand-text">Vue JS</span>
    </div>

    <!-- Spacer -->
    <v-spacer />

    <!-- Navigation Items -->
    <div class="navbar-items">
      <AppButton
        v-for="item in navItems"
        :key="item.to"
        :text="item.label"
        :to="item.to"
        :icon="item.icon"
        icon-type="prepend"
        :variant="isActive(item.to) ? 'tonal' : 'text'"
        :color="isActive(item.to) ? '#42b883' : 'white'"
        size="small"
        class="nav-button px-5 py-3"
      />
    </div>

    <!-- Logout Button -->
    <LogoutButton />
  </v-app-bar>
</template>

<style scoped>
.navbar-container {
  background-color: #1a1a1a !important;
  display: flex;
  align-items: center;
  padding: 0 24px;
}

.navbar-brand {
  display: flex;
  align-items: center;
  font-weight: 700;
  font-size: 18px;
  color: #42b883;
  text-decoration: none;
  margin-right: 32px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.navbar-brand:hover {
  color: #52d896;
}

.brand-text {
  letter-spacing: 1px;
}

.navbar-items {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-right: 16px;
}

.nav-button {
  font-weight: 500;
  text-transform: capitalize;
  letter-spacing: 0.5px;
  font-size: 14px;
  transition: all 0.2s ease;
}

.nav-button:hover {
  transform: translateY(-2px);
}

.logout-btn {
  margin-left: 8px;
  border-left: 1px solid rgba(255, 255, 255, 0.2);
  padding-left: 16px;
}

/* Responsive Design */
@media (max-width: 960px) {
  .navbar-items {
    gap: 4px;
  }

  .nav-button {
    font-size: 11px;
  }

  .navbar-brand {
    margin-right: 16px;
  }
}

@media (max-width: 600px) {
  .navbar-brand {
    display: none;
  }

  .navbar-items {
    flex-wrap: wrap;
    gap: 0;
  }

  .nav-button {
    min-width: auto;
    padding: 0 8px;
  }
}
</style>
