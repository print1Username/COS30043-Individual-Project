<script setup>
import { ref } from 'vue'
import AppButton from '@/components/ui/AppButton.vue'
import HomeButton from '@/components/ui/HomeButton.vue'
import HomePageField from '@/components/ui/HomePageField.vue'
import { handleForgotPassword } from '@/lib/auth'

const form = ref(null)
const email = ref('')
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const emailRules = [
  (value) => !!value || 'Email is required',
  (value) => /.+@.+\..+/.test(value) || 'Please enter a valid email address',
]

async function submitForgotPassword() {
  errorMessage.value = ''
  successMessage.value = ''

  const result = await form.value?.validate()

  if (!result?.valid) {
    console.info('[auth:failed] Password reset form validation failed')
    return
  }

  try {
    loading.value = true

    await handleForgotPassword({
      email: email.value.trim(),
      redirectTo: `${window.location.origin}/reset`,
    })

    localStorage.setItem(
      'passwordResetRequested',
      JSON.stringify({
        email: email.value.trim(),
        expiresAt: Date.now() + 15 * 60 * 1000,
      }),
    )

    successMessage.value = 'If this email is registered, Supabase will send a password reset email.'
  } catch (error) {
    errorMessage.value = error.message || 'Unable to send reset email. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <v-container fluid class="auth-page">
    <v-form ref="form" class="auth-form" @submit.prevent="submitForgotPassword">
      <HomeButton />

      <h1 class="text-h3 font-weight-bold text-center mb-8">Forgot Password</h1>

      <HomePageField
        v-model="email"
        label="Email"
        type="email"
        autocomplete="email"
        :rules="emailRules"
      />

      <p class="auth-switch text-body-2 mt-2 mb-4">
        <RouterLink to="/login">Back to Login</RouterLink>
      </p>

      <v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-4">
        {{ errorMessage }}
      </v-alert>

      <v-alert v-if="successMessage" type="success" variant="tonal" class="mb-4">
        {{ successMessage }}
      </v-alert>

      <AppButton
        text="Reset Password"
        type="submit"
        color="primary"
        block
        size="x-large"
        rounded="md"
        class="auth-submit"
        :loading="loading"
        :disabled="loading"
      />

      <p class="auth-switch text-body-2 text-center mt-6">
        Doesn't have account?
        <RouterLink to="/signup">Sign Up</RouterLink>
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
