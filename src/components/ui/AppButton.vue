<script setup>
import { computed } from 'vue'

const props = defineProps({
  text: {
    type: String,
    default: 'Button',
  },

  variant: {
    type: String,
    default: 'elevated',

    validator: (value) => {
      return [
        'outlined',
        'tonal',
        'text',
        'plain',
        'flat',
        'elevated',
      ].includes(value)
    },
  },

  icon: {
    type: String,
    default: null,
  },

  iconType: {
    type: String,
    default: null,

    validator: (value) => {
      return [
        null,
        'icon',
        'prepend',
        'append',
        'stacked',
      ].includes(value)
    },
  },
})

const buttonProps = computed(() => {
  switch (props.iconType) {
    case 'icon':
      return {
        icon: props.icon,
      }

    case 'prepend':
      return {
        prependIcon: props.icon,
      }

    case 'append':
      return {
        appendIcon: props.icon,
      }

    case 'stacked':
      return {
        prependIcon: props.icon,
        stacked: true,
      }

    default:
      return {}
  }
})
</script>

<template>
  <v-btn
    :variant="variant"
    v-bind="buttonProps"
  >
    {{ text }}
  </v-btn>
</template>