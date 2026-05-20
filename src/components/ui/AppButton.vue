<script setup>
import { computed } from 'vue'

const props = defineProps({
  text: {
    type: String,
    default: '',
  },

  color: {
    type: String,
    default: null,
  },

  variant: {
    type: String,
    default: 'elevated',

    validator: (value) => {
      return ['outlined', 'tonal', 'text', 'plain', 'flat', 'elevated'].includes(value)
    },
  },

  size: {
    type: [String, Number],
    default: null,

    validator: (value) => {
      if (value === null || typeof value === 'number') return true

      return ['x-small', 'small', 'default', 'large', 'x-large'].includes(value)
    },
  },

  density: {
    type: String,
    default: null,

    validator: (value) => {
      return [null, 'default', 'comfortable', 'compact'].includes(value)
    },
  },

  rounded: {
    type: [Boolean, String, Number],
    default: null,

    validator: (value) => {
      if (value === null || typeof value === 'boolean' || typeof value === 'number') return true

      return ['0', 'xs', 'sm', 'md', 'lg', 'xl', 'pill', 'circle', 'shaped'].includes(value)
    },
  },

  block: {
    type: Boolean,
    default: false,
  },

  disabled: {
    type: Boolean,
    default: false,
  },

  icon: {
    type: String,
    default: null,
  },

  iconColor: {
    type: String,
    default: null,
  },

  iconSize: {
    type: [String, Number],
    default: null,

    validator: (value) => {
      if (value === null || typeof value === 'number') return true

      return ['x-small', 'small', 'default', 'large', 'x-large'].includes(value)
    },
  },

  iconType: {
    type: String,
    default: null,

    validator: (value) => {
      return [null, 'icon', 'prepend', 'append', 'stacked'].includes(value)
    },
  },

  to: {
    type: String,
    default: null,
  },
})

const buttonProps = computed(() => {
  switch (props.iconType) {
    case 'icon':
      return {
        icon: true,
      }

    case 'prepend':
      return {
        prepend: true,
      }

    case 'append':
      return {
        append: true,
      }

    case 'stacked':
      return {
        stacked: true,
      }

    default:
      return {}
  }
})

const iconProps = computed(() => ({
  icon: props.icon,
  color: props.iconColor,
  size: props.iconSize,
}))
</script>

<template>
  <v-btn
    v-if="iconType === 'icon'"
    :variant="variant"
    :color="color"
    :size="size"
    :density="density"
    :rounded="rounded"
    :block="block"
    :disabled="disabled"
    v-bind="buttonProps"
    :to="to"
  >
    <v-icon v-bind="iconProps" />
  </v-btn>

  <v-btn
    v-else
    :variant="variant"
    :color="color"
    :size="size"
    :density="density"
    :rounded="rounded"
    :block="block"
    :disabled="disabled"
    v-bind="buttonProps"
    :to="to"
  >
    <template v-if="icon && ['prepend', 'stacked'].includes(iconType)" #prepend>
      <v-icon v-bind="iconProps" />
    </template>

    {{ text }}

    <template v-if="icon && iconType === 'append'" #append>
      <v-icon v-bind="iconProps" />
    </template>
  </v-btn>
</template>
