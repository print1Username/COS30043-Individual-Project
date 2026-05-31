<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import AppButton from '@/components/ui/AppButton.vue'
import HistoryItemCard from '@/components/ui/HistoryItemCard.vue'
import Pagination from '@/components/ui/Pagination.vue'
import { getHistory } from '@/lib/history'

const historyItems = ref([])
const loading = ref(false)
const errorMessage = ref('')
const page = ref(1)
const totalItems = ref(0)
const perPage = 10
const expandedHistoryId = ref(null)

const totalPages = computed(() => Math.max(Math.ceil(totalItems.value / perPage), 1))

const resultSummary = computed(() => {
  if (totalItems.value === 0) return 'No history records'

  const start = (page.value - 1) * perPage + 1
  const end = Math.min(page.value * perPage, totalItems.value)
  return `Showing ${start}-${end} of ${totalItems.value} records`
})

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

    if (!historyItems.value.some((item) => item.id === expandedHistoryId.value)) {
      expandedHistoryId.value = null
    }
  } catch (error) {
    console.error('[history:list]', error)
    errorMessage.value = error?.message || 'Unable to load history records.'
    historyItems.value = []
    totalItems.value = 0
    expandedHistoryId.value = null
  } finally {
    loading.value = false
  }
}

function toggleHistoryItem(itemId) {
  expandedHistoryId.value = expandedHistoryId.value === itemId ? null : itemId
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

        <div v-else class="history-list">
          <HistoryItemCard
            v-for="item in historyItems"
            :key="item.id"
            :item="item"
            :expanded="expandedHistoryId === item.id"
            @toggle="toggleHistoryItem(item.id)"
          />
        </div>

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
}
</style>
