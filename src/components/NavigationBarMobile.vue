<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import LogoutButton from '@/components/ui/LogoutButton.vue'

const router = useRouter()

const menuOpen = ref(false)
const searchQuery = ref('')

const navItems = [
  {
    label: 'Dashboard',
    icon: 'mdi-view-dashboard',
    to: '/dashboard',
  },
  {
    label: 'Products',
    icon: 'mdi-package',
    to: '/dashboard/products',
  },
  {
    label: 'History',
    icon: 'mdi-history',
    to: '/dashboard/history',
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

function submitSearch() {
  const q = searchQuery.value.trim()

  if (!q) return

  router.push({
    path: '/dashboard/search',
    query: { q },
  })

  searchQuery.value = ''
}

function navigate(to) {
  router.push(to)
  menuOpen.value = false
}
</script>

<template>
  <div class="mobile-navbar">
    <!-- Overlay -->
    <v-fade-transition>
      <div v-if="menuOpen" class="menu-overlay" @click="menuOpen = false" />
    </v-fade-transition>

    <!-- Menu -->
    <v-slide-y-transition>
      <div v-if="menuOpen" class="mobile-menu">
        <v-btn
          v-for="item in navItems"
          :key="item.to"
          class="menu-item"
          :class="{
            'menu-item-active': isActive(item.to),
          }"
          variant="text"
          @click="navigate(item.to)"
        >
          <div class="menu-content">
            <v-icon size="22">
              {{ item.icon }}
            </v-icon>

            <span>
              {{ item.label }}
            </span>
          </div>
        </v-btn>
      </div>
    </v-slide-y-transition>

    <!-- Navbar -->
    <v-app-bar color="#1a1a1a" elevation="4" height="64" class="navbar-bar">
      <v-btn icon variant="text" color="white" @click="menuOpen = !menuOpen">
        <v-icon>
          {{ menuOpen ? 'mdi-close' : 'mdi-menu' }}
        </v-icon>
      </v-btn>

      <div class="search-wrapper">
        <v-text-field
          v-model="searchQuery"
          placeholder="Search..."
          density="compact"
          variant="outlined"
          hide-details
          single-line
          prepend-inner-icon="mdi-magnify"
          class="search-input"
          @keydown.enter="submitSearch"
        />
      </div>

      <LogoutButton />
    </v-app-bar>
  </div>
</template>

<style scoped>
.mobile-navbar {
  position: relative;
}

/* Navbar */

.navbar-bar {
  z-index: 1001 !important;
}

.search-wrapper {
  flex: 1;
  margin: 0 12px;
}

.search-input :deep(.v-field) {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

/* Overlay */

.menu-overlay {
  position: fixed;

  top: 64px;
  left: 0;
  right: 0;
  bottom: 0;

  background: rgba(0, 0, 0, 0.78);

  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);

  z-index: 998;
}

/* Menu */

.mobile-menu {
  position: fixed;

  top: 64px;
  left: 0;
  right: 0;

  z-index: 999;

  display: flex;
  flex-direction: column;

  background: #181818;

  border-top: 1px solid rgba(66, 184, 131, 0.2);

  box-shadow:
    0 12px 32px rgba(0, 0, 0, 0.45),
    0 0 24px rgba(66, 184, 131, 0.08);
}

/* Buttons */

.menu-item {
  min-height: 64px;

  border-radius: 0 !important;

  color: white !important;

  transition: all 0.2s ease;
}

.menu-item:hover {
  background: rgba(66, 184, 131, 0.06);
}

.menu-item-active {
  background: rgba(66, 184, 131, 0.08);
}

.menu-item-active::before {
  content: '';

  position: absolute;

  top: 0;
  bottom: 0;
  left: 0;

  width: 3px;

  background: #42b883;
}

/* Content */

.menu-content {
  width: 100%;

  display: flex;
  align-items: center;
  justify-content: center;

  gap: 12px;

  font-size: 15px;
  font-weight: 600;
}

/* Icon */

.menu-content .v-icon {
  color: #42b883;
}
</style>
