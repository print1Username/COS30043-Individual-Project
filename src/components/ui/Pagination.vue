<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Number,
    default: 1,
  },
  totalPages: {
    type: Number,
    default: 1,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue'])

const safeTotalPages = computed(() => Math.max(Number(props.totalPages) || 1, 1))
const currentPage = computed(() =>
  Math.min(Math.max(Number(props.modelValue) || 1, 1), safeTotalPages.value),
)

function goToPage(page) {
  const nextPage = Math.min(Math.max(Number(page) || 1, 1), safeTotalPages.value)

  if (nextPage !== props.modelValue) {
    emit('update:modelValue', nextPage)
  }
}
</script>

<template>
  <nav class="pagination-bar" aria-label="Pagination">
    <v-btn
      icon
      variant="tonal"
      color="primary"
      size="small"
      :disabled="disabled || currentPage <= 1"
      aria-label="Previous page"
      @click="goToPage(currentPage - 1)"
    >
      <v-icon icon="mdi-chevron-left" />
    </v-btn>

    <v-pagination
      :model-value="currentPage"
      :length="safeTotalPages"
      :disabled="disabled"
      :total-visible="7"
      color="primary"
      density="comfortable"
      rounded="sm"
      @update:model-value="goToPage"
    />

    <v-btn
      icon
      variant="tonal"
      color="primary"
      size="small"
      :disabled="disabled || currentPage >= safeTotalPages"
      aria-label="Next page"
      @click="goToPage(currentPage + 1)"
    >
      <v-icon icon="mdi-chevron-right" />
    </v-btn>
  </nav>
</template>

<style scoped>
.pagination-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}
</style>
