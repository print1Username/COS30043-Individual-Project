<script setup>
import { computed } from 'vue'
import AppButton from '@/components/ui/AppButton.vue'

const model = defineModel()

const props = defineProps({
  label: String,
  type: {
    type: String,
    default: 'text',
  },
  rules: {
    type: Array,
    default: () => [],
  },
  autocomplete: String,

  revealable: {
    type: Boolean,
    default: false,
  },
})

const showPassword = defineModel('showPassword', {
  default: false,
})

const inputType = computed(() => {
  if (!props.revealable) {
    return props.type
  }

  return showPassword.value ? 'text' : 'password'
})

function revealPassword() {
  showPassword.value = true
}

function hidePassword() {
  showPassword.value = false
}
</script>

<template>
  <v-text-field
    v-model="model"
    class="auth-input my-4 mx-auto"
    :label="label"
    :type="inputType"
    :rules="rules"
    :autocomplete="autocomplete"
    variant="outlined"
    validate-on="blur"
  >
    <template v-if="revealable" #append-inner>
      <AppButton
        :icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
        class="password-toggle"
        icon-type="icon"
        variant="plain"
        density="compact"
        icon-size="default"
        aria-label="Hold to show password"
        @pointerdown.prevent="revealPassword"
        @pointerup="hidePassword"
        @pointerleave="hidePassword"
        @pointercancel="hidePassword"
      />
    </template>
  </v-text-field>
</template>

<style scoped>
.app-text-field {
  margin-bottom: 6px;
}

.app-text-field :deep(.v-field__input) {
  min-height: 62px;
  padding: 18px 18px 10px;
}

.app-text-field :deep(.v-field__append-inner) {
  padding-top: 14px;
}

.password-toggle {
  margin-top: -14px;
}
</style>
