<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AppButton from '@/components/ui/AppButton.vue'
import HomeButton from '@/components/ui/HomeButton.vue'
import HomePageField from '@/components/ui/HomePageField.vue'
import { handleUpdatePassword } from '@/lib/auth'

const router = useRouter()
const form = ref(null)
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const passwordRules = [
  (value) => !!value || 'Password is required',
  (value) => value.length >= 6 || 'Password must be at least 6 characters',
]
const confirmPasswordRules = [
  (value) => !!value || 'Confirm password is required',
  (value) => value === password.value || 'Passwords do not match',
]

async function submitResetPassword() {
  errorMessage.value = ''
  successMessage.value = ''

  const result = await form.value?.validate()

  if (!result?.valid) {
    console.info('[auth:failed] Reset password form validation failed')
    return
  }

  try {
    loading.value = true

    await handleUpdatePassword({
      password: password.value,
    })

    successMessage.value = 'Password updated successfully. Redirecting to login.'
    localStorage.removeItem('passwordResetRequested')
    await router.push('/login')
  } catch (error) {
    errorMessage.value = error.message || 'Unable to update password. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <v-container fluid class="auth-page">
    <v-form ref="form" class="auth-form" @submit.prevent="submitResetPassword">
      <HomeButton />

      <h1 class="text-h3 font-weight-bold text-center mb-8">Reset Password</h1>

      <HomePageField
        v-model="password"
        label="New Password"
        type="password"
        autocomplete="new-password"
        :rules="passwordRules"
        revealable
      />

      <HomePageField
        v-model="confirmPassword"
        label="Confirm New Password"
        type="password"
        autocomplete="new-password"
        :rules="confirmPasswordRules"
        revealable
      />

      <v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-4">
        {{ errorMessage }}
      </v-alert>

      <v-alert v-if="successMessage" type="success" variant="tonal" class="mb-4">
        {{ successMessage }}
      </v-alert>

      <AppButton
        text="Update Password"
        type="submit"
        color="primary"
        block
        size="x-large"
        rounded="md"
        class="auth-submit"
        :loading="loading"
        :disabled="loading"
      />
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

.auth-submit {
  min-height: 58px;
  padding-inline: 48px;
  font-size: 1.08rem;
  font-weight: 700;
  letter-spacing: 0;
}
</style>
