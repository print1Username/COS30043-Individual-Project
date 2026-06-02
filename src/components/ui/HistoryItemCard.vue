<script setup>
import { computed } from 'vue'

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
  expanded: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['toggle'])

const typeConfig = {
  add: {
    icon: 'mdi-plus-circle-outline',
    color: '#42b883',
    title: 'Product Created',
    description: 'A new product has been successfully added to your inventory.',
  },
  modify: {
    icon: 'mdi-pencil-outline',
    color: '#ffb01f',
    title: 'Product Modified',
    description: 'Product details have been updated and synchronized.',
  },
  success: {
    icon: 'mdi-check-circle-outline',
    color: '#4caf50',
    title: 'Trade Completed',
    description: 'Successful trade record was stored for both users.',
  },
  delete: {
    icon: 'mdi-delete-outline',
    color: '#ff5252',
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
  } catch {
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
  } catch {
    return isoString
  }
}

function formatPrice(value) {
  return `RM ${Number(value || 0).toFixed(2)}`
}

const typeDetails = computed(() => getTypeDetails(props.item?.history_type))
const productName = computed(() => props.item?.name || 'Unnamed product')

function handleToggle() {
  emit('toggle')
}
</script>

<template>
  <article class="history-item" :class="{ 'is-expanded': expanded }">
    <button class="history-item-trigger" type="button" @click="handleToggle">
      <div class="item-icon-container">
        <v-icon :icon="typeDetails.icon" :color="typeDetails.color" size="large" />
      </div>

      <div class="item-content">
        <div class="item-header">
          <span class="item-title" :style="{ color: typeDetails.color }">
            {{ typeDetails.title }}
          </span>
          <span class="item-time">
            <v-icon icon="mdi-clock-outline" size="x-small" class="mr-1" />
            {{ formatTime(item.created_at) }}
          </span>
        </div>

        <p class="item-description">
          <strong class="product-name">{{ productName }}</strong>
          <span class="separator">·</span>
          {{ typeDetails.description }}
        </p>

        <div class="item-meta-details">
          <span class="meta-badge">
            <v-icon icon="mdi-calendar-range" size="x-small" class="mr-1" />
            {{ formatDate(item.created_at) }}
          </span>
          <span class="meta-badge meta-badge--accent">
            <v-icon icon="mdi-tag-outline" size="x-small" class="mr-1" />
            {{ item.history_type }}
          </span>
        </div>
      </div>

      <div class="item-chevron">
        <v-icon :icon="expanded ? 'mdi-chevron-up' : 'mdi-chevron-down'" size="small" />
      </div>
    </button>

    <v-expand-transition>
      <div v-if="expanded" class="item-details">
        <v-row dense>
          <v-col cols="12" md="6">
            <div class="detail-box">
              <span class="detail-label">Product Name</span>
              <p class="detail-value">{{ productName }}</p>
            </div>
          </v-col>

          <v-col cols="12" md="6">
            <div class="detail-box">
              <span class="detail-label">History Type</span>
              <p class="detail-value">{{ typeDetails.title }}</p>
            </div>
          </v-col>

          <v-col cols="12" md="6">
            <div class="detail-box">
              <span class="detail-label">Logged At</span>
              <p class="detail-value">
                {{ formatDate(item.created_at) }} {{ formatTime(item.created_at) }}
              </p>
            </div>
          </v-col>

          <template v-if="item.history_type === 'success'">
            <v-col cols="12" md="4">
              <div class="detail-box">
                <span class="detail-label">Quantity</span>
                <p class="detail-value">{{ item.quantity || 0 }} pc</p>
              </div>
            </v-col>

            <v-col cols="12" md="4">
              <div class="detail-box">
                <span class="detail-label">Unit Price</span>
                <p class="detail-value">{{ formatPrice(item.unit_price) }}</p>
              </div>
            </v-col>

            <v-col cols="12" md="4">
              <div class="detail-box">
                <span class="detail-label">Total Price</span>
                <p class="detail-value">{{ formatPrice(item.total_price) }}</p>
              </div>
            </v-col>
          </template>
        </v-row>
      </div>
    </v-expand-transition>
  </article>
</template>

<style scoped>
.history-item {
  background-color: #0c130f;
  border: 1px solid rgba(66, 184, 131, 0.1);
  border-left-width: 5px;
  border-radius: 10px;
  overflow: hidden;
  transition: all 0.2s ease-in-out;
}

.history-item:hover {
  transform: translateY(-1px);
  background-color: #121c16;
  border-color: rgba(66, 184, 131, 0.2);
}

.history-item.is-expanded {
  border-color: rgba(66, 184, 131, 0.3);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.18);
}

.history-item-trigger {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 18px 20px;
  background: transparent;
  color: inherit;
  border: 0;
  text-align: left;
  cursor: pointer;
}

.history-item-trigger:focus-visible {
  outline: 2px solid #42b883;
  outline-offset: -2px;
}

.item-icon-container {
  display: flex;
  align-items: flex-start;
  padding-top: 2px;
  flex-shrink: 0;
}

.item-content {
  flex: 1;
  min-width: 0;
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
  margin: 0;
  line-height: 1.5;
}

.product-name {
  color: #e7f8ee;
  font-weight: 700;
}

.separator {
  color: #6e8277;
  margin: 0 6px;
}

.item-meta-details {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 11px;
  margin-top: 10px;
}

.meta-badge {
  background: rgba(255, 255, 255, 0.05);
  color: #8da194;
  padding: 4px 10px;
  border-radius: 999px;
  font-family: monospace;
  display: inline-flex;
  align-items: center;
}

.meta-badge--accent {
  color: #cfeedd;
  background: rgba(66, 184, 131, 0.12);
}

.item-chevron {
  color: #9fb3a7;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.item-details {
  padding: 0 20px 18px 56px;
}

.detail-box {
  height: 100%;
  padding: 12px 14px;
  border: 1px solid rgba(66, 184, 131, 0.14);
  border-radius: 8px;
  background: rgba(66, 184, 131, 0.03);
}

.detail-label {
  display: block;
  color: #42b883;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.detail-value {
  margin: 0;
  color: #e7f8ee;
  font-size: 14px;
  line-height: 1.45;
  word-break: break-word;
}

.detail-value--mono {
  font-family: monospace;
  font-size: 12px;
  color: #b9c8bf;
}

@media (max-width: 760px) {
  .history-item-trigger {
    padding: 16px;
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .item-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .item-description {
    font-size: 13px;
  }

  .item-details {
    padding: 0 16px 16px;
  }

  .item-chevron {
    justify-content: flex-end;
  }
}
</style>
