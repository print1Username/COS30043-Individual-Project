<script setup>
const actions = [
  {
    label: 'Add Product',
    description: 'Create a new product',
    icon: 'mdi-plus-circle-outline',
    color: '#42b883',
    to: '/dashboard/products/create',
  },
  {
    label: 'My Products',
    description: 'Browse your catalogue',
    icon: 'mdi-package-variant',
    color: '#64b5f6',
    to: '/dashboard/products',
  },
  {
    label: 'History',
    description: 'View activity logs',
    icon: 'mdi-history',
    color: '#ffb01f',
    to: '/dashboard/history',
  },
  {
    label: 'Profile',
    description: 'Manage your account',
    icon: 'mdi-account-circle-outline',
    color: '#ce93d8',
    to: '/dashboard/profile',
  },
]
</script>

<template>
  <v-card class="actions-card pa-5 h-100" elevation="0">
    <p class="text-overline text-primary mb-1">Quick Access</p>
    <h2 class="actions-title mb-4">Shortcuts</h2>

    <div class="actions-grid">
      <v-btn
        v-for="action in actions"
        :key="action.to"
        :to="action.to"
        variant="tonal"
        class="action-btn"
      >
        <div class="action-inner">
          <v-icon :icon="action.icon" :color="action.color" size="28" class="mb-1" />
          <span class="action-label">{{ action.label }}</span>
          <span class="action-desc">{{ action.description }}</span>
        </div>
      </v-btn>
    </div>
  </v-card>
</template>

<style scoped>
.actions-card {
  background: #0d1511;
  border: 1px solid rgba(66, 184, 131, 0.14);
  border-radius: 12px;
}

.actions-title {
  font-size: 18px;
  font-weight: 700;
  color: #e7f8ee;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

@media (max-width: 960px) {
  .actions-grid {
    grid-template-columns: repeat(2, 1fr);
    padding-bottom: 60px;
  }
}

.action-btn {
  min-height: 110px;
  padding: 0 !important;
}

.action-btn {
  background: rgba(66, 184, 131, 0.06) !important;
  border: 1px solid rgba(66, 184, 131, 0.12);
  border-radius: 10px !important;
  transition:
    border-color 0.2s,
    transform 0.15s;

  min-height: 110px;
  padding: 0 !important;
}

.action-btn:hover {
  border-color: rgba(66, 184, 131, 0.4);
  transform: translateY(-2px);
}

.action-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  width: 100%;
  padding: 12px 8px;
}

.action-label {
  font-size: 13px;
  font-weight: 600;
  color: #e7f8ee;
  line-height: 1.2;
}

.action-desc {
  font-size: 11px;
  color: #7aab8c;
  line-height: 1.2;
}
</style>
