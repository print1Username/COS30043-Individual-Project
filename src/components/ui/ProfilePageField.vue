<script setup>
import { ref, watch, computed, onBeforeUnmount } from 'vue'

const props = defineProps({
  label: {
    type: String,
    required: true,
  },
  value: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: '',
  },
  multiline: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  validateFn: {
    type: Function,
    default: null,
  },
  transformFn: {
    type: Function,
    default: null,
  },
  warningMessage: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['save', 'cancel', 'validation-error'])

const editing = ref(false)
const draftValue = ref(props.value)
const warningVisible = ref(false)
let warningTimer = null

watch(
  () => props.value,
  (newValue) => {
    if (!editing.value) {
      draftValue.value = newValue
    }
  },
)

const displayValue = computed(() => {
  return props.value?.trim() ? props.value : 'Not set yet'
})

const draftModel = computed({
  get() {
    return draftValue.value
  },
  set(value) {
    if (!props.transformFn) {
      draftValue.value = value
      return
    }

    const transformed = props.transformFn(value)
    draftValue.value = transformed

    if (transformed !== value) {
      showWarning()
      emit('validation-error', transformed)
    }
  },
})

function showWarning() {
  if (!props.warningMessage) return

  warningVisible.value = true
  if (warningTimer) {
    clearTimeout(warningTimer)
  }

  warningTimer = setTimeout(() => {
    warningVisible.value = false
    warningTimer = null
  }, 10000)
}

function startEdit() {
  if (props.disabled) return
  editing.value = true
  draftValue.value = props.value
}

function save() {
  editing.value = false
  emit('save', draftValue.value)
}

function cancel() {
  editing.value = false
  draftValue.value = props.value
  emit('cancel')
}

onBeforeUnmount(() => {
  if (warningTimer) {
    clearTimeout(warningTimer)
  }
})
</script>

<template>
  <div class="profile-page-field">
    <div class="field-content">
      <div class="field-meta">
        <span class="field-label">{{ label }}</span>
      </div>

      <div class="field-body">
        <template v-if="editing">
          <v-textarea
            v-if="multiline"
            v-model="draftModel"
            density="comfortable"
            :placeholder="placeholder"
            rows="4"
            class="field-input"
          />
          <v-text-field
            v-else
            v-model="draftModel"
            density="comfortable"
            :placeholder="placeholder"
            class="field-input"
          />
          <v-alert
            v-if="warningVisible"
            type="warning"
            variant="tonal"
            density="compact"
            class="mt-2"
          >
            {{ warningMessage }}
          </v-alert>
        </template>
        <template v-else>
          <p class="field-value">{{ displayValue }}</p>
        </template>
      </div>
    </div>

    <div class="field-actions">
      <v-btn
        icon
        color="primary"
        class="edit-button"
        @click="startEdit"
        :disabled="editing || disabled"
      >
        <v-icon>mdi-pencil</v-icon>
      </v-btn>
      <template v-if="editing">
        <v-btn small color="success" variant="tonal" class="action-button" @click="save">
          Save
        </v-btn>
        <v-btn small color="error" variant="text" class="action-button" @click="cancel">
          Cancel
        </v-btn>
      </template>
    </div>
  </div>
</template>

<style scoped>
.profile-page-field {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 16px;
  align-items: flex-start;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(66, 184, 131, 0.12);
  border-radius: 16px;
  padding: 18px;
  margin-bottom: 18px;
}

.field-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.field-label {
  font-weight: 700;
  color: #d6ebd9;
}

.field-body {
  width: 100%;
}

.field-input {
  width: 100%;
}

.field-value {
  margin: 0;
  color: #cbd8c4;
  line-height: 1.8;
}

.field-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

.edit-button {
  min-width: 44px;
  min-height: 44px;
  border-radius: 50%;
  background: rgba(66, 184, 131, 0.12);
}

.action-button {
  min-width: 88px;
}
</style>
