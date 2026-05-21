<script setup>
import { ref } from 'vue'
import AppButton from '@/components/ui/AppButton.vue'
import HomeButton from '@/components/ui/HomeButton.vue'
import HomePageField from '@/components/ui/HomePageField.vue'

import { handleSignUp } from '@/composables/auth'

const username = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')

const requiredRules = [(value) => !!value || 'This field is required']
const emailRules = [
  (value) => !!value || 'Email is required',
  (value) => /.+@.+\..+/.test(value) || 'Please enter a valid email address',
]
const confirmPasswordRules = [
  (value) => !!value || 'Confirm password is required',
  (value) => value === password.value || 'Passwords do not match',
]
</script>

<template>
  <v-container fluid class="auth-page">
    <v-form class="auth-form" @submit.prevent>
      <HomeButton />

      <h1 class="text-h3 font-weight-bold text-center mb-8">Sign Up</h1>

      <HomePageField
        v-model="username"
        label="Username"
        autocomplete="username"
        :rules="requiredRules"
      />

      <HomePageField
        v-model="email"
        label="Email"
        type="email"
        autocomplete="email"
        :rules="emailRules"
      />

      <HomePageField
        v-model="password"
        label="Password"
        type="password"
        autocomplete="new-password"
        :rules="requiredRules"
        revealable
      />

      <HomePageField
        v-model="confirmPassword"
        label="Confirm Password"
        type="pasword"
        autocomplete="new-password"
        :rules="confirmPasswordRules"
      />

      <AppButton
        text="Sign Up"
        type="submit"
        color="primary"
        block
        size="x-large"
        rounded="md"
        class="auth-submit"
      />

      <p class="auth-switch text-body-2 text-center mt-6">
        Already have an account?
        <RouterLink to="/login">Login</RouterLink>
      </p>
    </v-form>
  </v-container>
</template>

<style scoped>
.auth-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 24px;
}

.auth-form {
  width: 100%;
  max-width: 460px;
}

.auth-input {
  margin-bottom: 6px;
}

.auth-input :deep(.v-field__input) {
  min-height: 62px;
  padding: 18px 18px 10px;
}

.auth-input :deep(.v-field__append-inner) {
  padding-top: 14px;
}

.auth-submit {
  min-height: 58px;
  padding-inline: 48px;
  font-size: 1.08rem;
  font-weight: 700;
  letter-spacing: 0;
}

.auth-switch {
  color: rgb(var(--v-theme-on-surface-variant));
}

.auth-switch a {
  color: rgb(var(--v-theme-primary));
  font-weight: 600;
  text-decoration: none;
}

.auth-switch a:hover {
  text-decoration: underline;
}
</style>
