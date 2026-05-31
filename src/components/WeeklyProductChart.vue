<script setup>
import { ref, computed, onMounted } from 'vue'
import { getWeeklyProductCounts } from '@/lib/home'

const days = ref([])
const loading = ref(false)
const error = ref('')

const chartHeight = 140
const barWidth = 32
const gap = 16
const paddingX = 12
const yAxisWidth = 32

const maxCount = computed(() => Math.max(...days.value.map((d) => d.count), 1))

const totalWidth = computed(
  () => yAxisWidth + days.value.length * (barWidth + gap) - gap + paddingX * 2,
)

const totalItems = computed(() => days.value.reduce((sum, d) => sum + d.count, 0))

function barHeight(count) {
  return Math.max((count / maxCount.value) * chartHeight, count > 0 ? 4 : 0)
}

function barX(index) {
  return yAxisWidth + paddingX + index * (barWidth + gap)
}

function barY(count) {
  return chartHeight - barHeight(count)
}

const todayDate = new Date().toISOString().slice(0, 10)

async function load() {
  loading.value = true
  error.value = ''
  try {
    days.value = await getWeeklyProductCounts()
  } catch (err) {
    console.error('[home:chart]', err)
    error.value = err?.message || 'Failed to load chart data.'
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<template>
  <v-card class="chart-card pa-5 h-100" elevation="0">
    <div class="chart-header mb-4">
      <div>
        <p class="text-overline text-primary mb-1">This Week</p>
        <h2 class="chart-title">Products Created</h2>
      </div>
      <v-chip color="primary" variant="tonal" size="small"> {{ totalItems }} total </v-chip>
    </div>

    <div v-if="loading" class="chart-loading">
      <v-progress-circular indeterminate color="primary" size="36" />
    </div>

    <v-alert v-else-if="error" type="error" variant="tonal" density="compact">
      {{ error }}
    </v-alert>

    <div v-else class="chart-body">
      <svg :width="totalWidth" :height="chartHeight + 28" class="chart-svg">
        <!-- Y Axis Labels -->
        <g>
          <text
            v-for="n in 5"
            :key="`label-${n}`"
            x="28"
            :y="chartHeight - (chartHeight / 4) * (n - 1) + 12"
            text-anchor="end"
            fill="#6b8f7a"
            font-size="11"
            font-family="Inter, sans-serif"
          >
            {{ Math.round((maxCount / 4) * (n - 1)) }}
          </text>
        </g>

        <!-- Grid lines -->
        <line
          v-for="n in 4"
          :key="n"
          :x1="yAxisWidth"
          :y1="chartHeight - (chartHeight / 4) * n"
          :x2="totalWidth"
          :y2="chartHeight - (chartHeight / 4) * n"
          stroke="rgba(66,184,131,0.1)"
          stroke-width="1"
        />

        <!-- Bars -->
        <g v-for="(day, i) in days" :key="day.date">
          <!-- Bar background track -->
          <rect
            :x="barX(i)"
            :y="0"
            :width="barWidth"
            :height="chartHeight"
            rx="6"
            fill="rgba(66,184,131,0.05)"
          />
          <!-- Actual bar -->
          <rect
            :x="barX(i)"
            :y="barY(day.count)"
            :width="barWidth"
            :height="barHeight(day.count)"
            rx="6"
            :fill="day.date === todayDate ? '#42b883' : 'rgba(66,184,131,0.45)'"
          />
          <!-- Count label above bar -->
          <text
            v-if="day.count > 0"
            :x="barX(i) + barWidth / 2"
            :y="Math.max(12, barY(day.count) - 5)"
            text-anchor="middle"
            fill="#a8e6c8"
            font-size="11"
            font-family="Inter, sans-serif"
          >
            {{ day.count }}
          </text>
          <!-- Day label below -->
          <text
            :x="barX(i) + barWidth / 2"
            :y="chartHeight + 18"
            text-anchor="middle"
            :fill="day.date === todayDate ? '#42b883' : '#6b8f7a'"
            font-size="12"
            font-family="Inter, sans-serif"
            :font-weight="day.date === todayDate ? '700' : '400'"
          >
            {{ day.label }}
          </text>
        </g>
      </svg>

      <p v-if="totalItems === 0" class="chart-empty">No products created this week yet.</p>
    </div>
  </v-card>
</template>

<style scoped>
.chart-card {
  background: #0d1511;
  border: 1px solid rgba(66, 184, 131, 0.14);
  border-radius: 12px;
}

.chart-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.chart-title {
  font-size: 18px;
  font-weight: 700;
  color: #e7f8ee;
}

.chart-loading {
  display: flex;
  justify-content: center;
  padding: 40px 0;
}

.chart-body {
  overflow-x: auto;
}

.chart-svg {
  display: block;
  min-width: 100%;
}

.chart-empty {
  margin-top: 8px;
  color: #6b8f7a;
  font-size: 13px;
}
</style>
