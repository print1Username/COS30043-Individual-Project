<script setup>
import AppButton from '@/components/ui/AppButton.vue'
</script>

<template>
  <div class="auth-back">
    <AppButton
      text="Home"
      to="/"
      icon="mdi-arrow-left"
      icon-type="prepend"
      variant="tonal"
      color="primary"
      rounded="md"
      class="px-6 py-3"
    />
  </div>
</template>

<style scoped>
.auth-back {
  display: flex;
  justify-content: left;
  margin-bottom: 24px;
}
</style>
