<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import AppButton from '@/components/ui/AppButton.vue'
import Pagination from '@/components/ui/Pagination.vue'
import { getHistory } from '@/lib/history'

const historyItems = ref([])
const loading = ref(false)
const errorMessage = ref('')
const page = ref(1)
const totalItems = ref(0)
const perPage = 30

const totalPages = computed(() => Math.max(Math.ceil(totalItems.value / perPage), 1))

const resultSummary = computed(() => {
  if (totalItems.value === 0) return 'No history records'

  const start = (page.value - 1) * perPage + 1
  const end = Math.min(page.value * perPage, totalItems.value)
  return `Showing ${start}-${end} of ${totalItems.value} records`
})

// Configuration mapping for history types to icons, colors, and text descriptions
const typeConfig = {
  add: {
    icon: 'mdi-plus-circle-outline',
    color: '#42b883', // Vue Green
    title: 'Product Created',
    description: 'A new product has been successfully added to your inventory.',
  },
  modify: {
    icon: 'mdi-pencil-outline',
    color: '#ffb01f', // Amber/Yellow
    title: 'Product Modified',
    description: 'Product details have been updated and synchronized.',
  },
  success: {
    icon: 'mdi-check-circle-outline',
    color: '#4caf50', // Success Green
    title: 'Operation Completed',
    description: 'Inventory operation was successfully executed.',
  },
  delete: {
    icon: 'mdi-delete-outline',
    color: '#ff5252', // Red
    title: 'Product Deleted',
    description: 'A product has been removed from your inventory.',
  },
}

function getTypeDetails(type) {
  return (
    typeConfig[type] || {
      icon: 'mdi-clock-outline',
      color: '#9fb3a7',
      title: 'Activity Logged',
      description: 'Inventory system logged an activity.',
    }
  )
}

function formatTime(isoString) {
  if (!isoString) return ''
  try {
    const date = new Date(isoString)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    })
  } catch (error) {
    return isoString
  }
}

function formatDate(isoString) {
  if (!isoString) return ''
  try {
    const date = new Date(isoString)
    const day = date.getDate()
    const month = date.toLocaleDateString('en-US', { month: 'long' })
    const year = date.getFullYear()
    return `${day} ${month} ${year}`
  } catch (error) {
    return isoString
  }
}

async function loadHistory() {
  loading.value = true
  errorMessage.value = ''

  try {
    const result = await getHistory({
      page: page.value,
      perPage,
    })

    historyItems.value = result.history
    totalItems.value = result.total

    if (page.value > totalPages.value) {
      page.value = totalPages.value
    }
  } catch (error) {
    console.error('[history:list]', error)
    errorMessage.value = error?.message || 'Unable to load history records.'
    historyItems.value = []
    totalItems.value = 0
  } finally {
    loading.value = false
  }
}

watch(page, () => {
  loadHistory()
})

onMounted(() => {
  loadHistory()
})
</script>

<template>
  <v-container fluid class="history-page">
    <section class="history-shell">
      <header class="history-header">
        <div class="history-heading">
          <p class="text-overline text-primary mb-2">Logs</p>
          <h1 class="text-h3 font-weight-bold mb-3">Activity History</h1>
          <p class="text-body-1 history-description">
            Monitor and track your inventory actions. Product additions, updates, and deletions are
            automatically logged and retained securely for your reference.
          </p>
        </div>
      </header>

      <v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-5">
        {{ errorMessage }}
      </v-alert>

      <div class="history-meta">
        <span class="meta-summary">{{ resultSummary }}</span>
        <span class="meta-limit">{{ perPage }} records per page</span>
      </div>

      <div v-if="loading" class="d-flex justify-center align-center py-12">
        <v-progress-circular indeterminate color="primary" size="64" />
      </div>

      <template v-else>
        <!-- Empty State -->
        <div v-if="historyItems.length === 0" class="empty-state">
          <v-icon icon="mdi-history" size="80" color="#35495e" class="mb-4" />
          <h3 class="text-h5 font-weight-bold mb-2">No History Logged Yet</h3>
          <p class="text-body-1 text-medium-emphasis mb-6">
            When you manage products, your additions, edits, and deletions will be recorded here.
          </p>
          <AppButton
            text="Manage Products"
            to="/dashboard/products"
            color="primary"
            variant="flat"
            rounded="md"
            icon="mdi-package"
            icon-type="prepend"
            class="px-4 py-3"
          />
        </div>

        <!-- History List -->
        <div v-else class="history-list">
          <div
            v-for="item in historyItems"
            :key="item.id"
            class="history-item"
            :style="{ borderLeftColor: getTypeDetails(item.history_type).color }"
          >
            <div class="item-icon-container">
              <v-icon
                :icon="getTypeDetails(item.history_type).icon"
                :color="getTypeDetails(item.history_type).color"
                size="large"
              />
            </div>
            <div class="item-content">
              <div class="item-header">
                <span
                  class="item-title"
                  :style="{ color: getTypeDetails(item.history_type).color }"
                >
                  {{ getTypeDetails(item.history_type).title }}
                </span>
                <span class="item-time">
                  <v-icon icon="mdi-clock-outline" size="x-small" class="mr-1" />
                  {{ formatTime(item.created_at) }}
                </span>
              </div>
              <p class="item-description">
                {{ getTypeDetails(item.history_type).description }}
              </p>
              <div class="item-meta-details">
                <span class="meta-badge">
                  <v-icon icon="mdi-calendar-range" size="x-small" class="mr-1" />
                  {{ formatDate(item.created_at) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <Pagination
          v-if="totalItems > perPage"
          v-model="page"
          :total-pages="totalPages"
          :disabled="loading"
          class="mt-8"
        />
      </template>
    </section>
  </v-container>
</template>

<style scoped>
.history-page {
  min-height: 100vh;
  padding: 104px 32px 40px;
  background:
    radial-gradient(circle at top left, rgba(66, 184, 131, 0.12), transparent 36%), #050806;
}

.history-shell {
  max-width: 900px;
  width: 100%;
  margin: 0 auto;
}

.history-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 26px;
}

.history-heading {
  max-width: 720px;
}

.history-heading h1 {
  color: #e7f8ee;
}

.history-description {
  color: #bdc9c0;
}

.history-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
  color: #9fb3a7;
  font-size: 14px;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.history-item {
  background-color: #0c130f;
  border: 1px solid rgba(66, 184, 131, 0.1);
  border-left-width: 5px;
  border-radius: 8px;
  padding: 18px 24px;
  display: flex;
  gap: 18px;
  transition: all 0.2s ease-in-out;
}

.history-item:hover {
  transform: translateX(4px);
  background-color: #121c16;
  border-color: rgba(66, 184, 131, 0.2);
}

.item-icon-container {
  display: flex;
  align-items: flex-start;
  padding-top: 2px;
}

.item-content {
  flex: 1;
}

.item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 6px;
}

.item-title {
  font-weight: 700;
  font-size: 16px;
  letter-spacing: 0.5px;
}

.item-time {
  font-size: 13px;
  color: #8da194;
  display: flex;
  align-items: center;
}

.item-description {
  font-size: 14px;
  color: #bdc9c0;
  margin-bottom: 8px;
  line-height: 1.4;
}

.item-meta-details {
  display: flex;
  gap: 8px;
  font-size: 11px;
}

.meta-badge {
  background: rgba(255, 255, 255, 0.05);
  color: #8da194;
  padding: 2px 8px;
  border-radius: 4px;
  font-family: monospace;
}

.empty-state {
  text-align: center;
  padding: 60px 24px;
  background-color: #0c130f;
  border: 1px dashed rgba(66, 184, 131, 0.2);
  border-radius: 12px;
}

@media (max-width: 760px) {
  .history-page {
    padding: 92px 18px 32px;
  }

  .history-header,
  .history-meta {
    flex-direction: column;
    align-items: stretch;
  }

  .history-item {
    padding: 16px;
    flex-direction: column;
    gap: 12px;
  }

  .item-icon-container {
    padding-top: 0;
  }

  .item-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
}
</style>
