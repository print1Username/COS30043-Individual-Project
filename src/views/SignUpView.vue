<script setup>
import { onBeforeUnmount, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import AppButton from '@/components/ui/AppButton.vue'
import HomeButton from '@/components/ui/HomeButton.vue'
import HomePageField from '@/components/ui/HomePageField.vue'

import { handleSignUp } from '@/lib/auth'
import { normalizeUsername } from '@/lib/profile'

const router = useRouter()
const form = ref(null)
const username = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const usernameWarning = ref('')
let usernameWarningTimer = null

const requiredRules = [(value) => !!value || 'This field is required']
const emailRules = [
  (value) => !!value || 'Email is required',
  (value) => /.+@.+\..+/.test(value) || 'Please enter a valid email address',
]
const passwordRules = [
  (value) => !!value || 'Password is required',
  (value) => value.length >= 6 || 'Password must be at least 6 characters',
]
const confirmPasswordRules = [
  (value) => !!value || 'Confirm password is required',
  (value) => value === password.value || 'Passwords do not match',
]

watch(username, (value) => {
  const normalized = normalizeUsername(value)
  if (normalized === value) return

  username.value = normalized
  usernameWarning.value = 'Only lowercase letters, numbers, and _ are allowed for username.'

  if (usernameWarningTimer) {
    clearTimeout(usernameWarningTimer)
  }

  usernameWarningTimer = setTimeout(() => {
    usernameWarning.value = ''
    usernameWarningTimer = null
  }, 10000)
})

async function submitSignUp() {
  errorMessage.value = ''
  successMessage.value = ''

  const result = await form.value?.validate()

  if (!result?.valid) {
    console.info('[auth:failed] Sign up form validation failed')
    return
  }

  try {
    loading.value = true

    const data = await handleSignUp({
      username: username.value.trim(),
      email: email.value.trim(),
      password: password.value,
      redirectTo: `${window.location.origin}/dashboard`,
    })

    if (data.session) {
      await router.push('/dashboard')
      return
    }

    successMessage.value = 'Sign up successful. Please check your email to confirm your account.'
  } catch (error) {
    errorMessage.value = error.message || 'Unable to sign up. Please try again.'
  } finally {
    loading.value = false
  }
}

onBeforeUnmount(() => {
  if (usernameWarningTimer) {
    clearTimeout(usernameWarningTimer)
  }
})
</script>

<template>
  <v-container fluid class="auth-page">
    <v-form ref="form" class="auth-form" @submit.prevent="submitSignUp">
      <HomeButton />

      <h1 class="text-h3 font-weight-bold text-center mb-8">Sign Up</h1>

      <HomePageField
        v-model="username"
        label="Username"
        autocomplete="username"
        :rules="requiredRules"
      />

      <v-alert v-if="usernameWarning" type="warning" variant="tonal" density="compact" class="mb-4">
        {{ usernameWarning }}
      </v-alert>

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
        :rules="passwordRules"
        revealable
      />

      <HomePageField
        v-model="confirmPassword"
        label="Confirm Password"
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
        text="Sign Up"
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
