<script setup>
import { computed, ref, watch } from 'vue'
import { calculateTotalPrice, formatPrice } from '@/lib/trades'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  productName: {
    type: String,
    default: '',
  },
  availableQuantity: {
    type: Number,
    default: 0,
  },
  unitPrice: {
    type: [Number, String],
    default: 0,
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

const quantity = ref(1)

const dialogOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const maxQuantity = computed(() => Math.max(Number(props.availableQuantity) || 0, 0))
const safeUnitPrice = computed(() => Number(props.unitPrice) || 0)
const totalPrice = computed(() => calculateTotalPrice(quantity.value, safeUnitPrice.value))
const canConfirm = computed(() => quantity.value >= 1 && quantity.value <= maxQuantity.value)

function clampQuantity(value) {
  const nextValue = Math.floor(Number(value) || 1)
  quantity.value = Math.min(Math.max(nextValue, 1), Math.max(maxQuantity.value, 1))
}

function cancelTrade() {
  if (props.loading) return
  emit('cancel')
  dialogOpen.value = false
}

function confirmTrade() {
  if (!canConfirm.value || props.loading) return
  emit('confirm', quantity.value)
}

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) clampQuantity(1)
  },
)

watch(maxQuantity, () => {
  clampQuantity(quantity.value)
})
</script>

<template>
  <v-dialog v-model="dialogOpen" max-width="460" persistent>
    <v-card class="trade-card">
      <v-card-title class="trade-title">
        <v-icon icon="mdi-handshake-outline" color="primary" />
        Trade Product
      </v-card-title>

      <v-card-text class="trade-body">
        <div class="trade-product">
          <span class="trade-label">Product</span>
          <strong>{{ productName || 'Unnamed product' }}</strong>
        </div>

        <div class="trade-summary">
          <div>
            <span class="trade-label">Unit Price</span>
            <p>{{ formatPrice(safeUnitPrice) }}</p>
          </div>
          <div>
            <span class="trade-label">Available</span>
            <p>{{ maxQuantity }} pc</p>
          </div>
        </div>

        <v-slider
          v-model="quantity"
          :min="1"
          :max="Math.max(maxQuantity, 1)"
          :disabled="maxQuantity < 1 || loading"
          color="primary"
          track-color="#35495e"
          thumb-label
          step="1"
          hide-details
          class="mt-3"
          @update:model-value="clampQuantity"
        />

        <v-text-field
          v-model.number="quantity"
          label="Quantity"
          type="number"
          min="1"
          :max="maxQuantity"
          :disabled="maxQuantity < 1 || loading"
          color="primary"
          variant="outlined"
          density="comfortable"
          prepend-inner-icon="mdi-counter"
          class="mt-3"
          @blur="clampQuantity(quantity)"
        />

        <div class="trade-total">
          <span>Total Price</span>
          <strong>{{ formatPrice(totalPrice) }}</strong>
        </div>
      </v-card-text>

      <v-card-actions class="trade-actions">
        <v-btn variant="text" color="white" :disabled="loading" @click="cancelTrade">
          Cancel
        </v-btn>
        <v-btn
          color="primary"
          variant="flat"
          prepend-icon="mdi-check-circle-outline"
          :loading="loading"
          :disabled="!canConfirm"
          @click="confirmTrade"
        >
          Confirm
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.trade-card {
  border: 1px solid rgba(66, 184, 131, 0.24);
  border-radius: 8px;
  background: #0d1511;
  color: #e7f8ee;
  overflow: hidden;
}

.trade-title {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #101d17;
  border-bottom: 1px solid rgba(66, 184, 131, 0.16);
  font-weight: 700;
}

.trade-body {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.trade-label {
  display: block;
  color: #42b883;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.trade-product,
.trade-summary > div,
.trade-total {
  border: 1px solid rgba(66, 184, 131, 0.14);
  border-radius: 8px;
  background: rgba(66, 184, 131, 0.04);
  padding: 12px;
}

.trade-summary {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.trade-summary p {
  margin: 2px 0 0;
  color: #e7f8ee;
}

.trade-total {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.trade-total strong {
  color: #42b883;
  font-size: 22px;
}

.trade-actions {
  justify-content: flex-end;
  gap: 8px;
  padding: 0 24px 20px;
}

@media (max-width: 520px) {
  .trade-summary {
    grid-template-columns: 1fr;
  }
}
</style>
