<script setup>
import { ref, computed, onBeforeUnmount, onMounted } from 'vue'
import AvatarCropping from '@/components/AvatarCropping.vue'
import ProfilePageField from '@/components/ui/ProfilePageField.vue'
import { supabase } from '@/lib/supabase'
import {
  getProfile,
  upsertProfile,
  uploadAvatar,
  getAvatarUrl,
  normalizeUsername,
} from '@/lib/profile'

const profile = ref({
  username: '',
  display_name: '',
  bio: '',
  avatar_url: '',
  created_at: null,
  update_at: null,
})
const avatarUrl = ref('')
const loading = ref(false)
const message = ref('')
const messageType = ref('success')
const userId = ref('')
const fallbackUsername = ref('')
const croppingOpen = ref(false)
const selectedFile = ref(null)
const fileInput = ref(null)
let messageTimer = null

const createdAtFormatted = computed(() => formatDate(profile.value.created_at))
const updatedAtFormatted = computed(() => formatDate(profile.value.update_at))
const avatarDisplayUrl = computed(() => avatarUrl.value || '')
const usernameWarning = 'Only lowercase letters, numbers, and _ are allowed for username.'

function formatDate(value) {
  if (!value) return '-'
  const date = new Date(value)
  const datePart = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
  const timePart = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  })
    .format(date)
    .toLowerCase()

  return `${datePart}, ${timePart}`
}

function makeDefaultUsername(user) {
  const metadataUsername = user.user_metadata?.username || ''
  const emailUsername = user.email?.split('@')[0] || ''
  const normalized = normalizeUsername(metadataUsername || emailUsername)

  if (normalized) {
    return normalized
  }

  const idLetters = (user.id || '').replace(/[^a-f]/g, '')
  return `user_${idLetters || 'profile'}`
}

function buildProfilePayload(changes = {}) {
  const username = normalizeUsername(
    changes.username ?? profile.value.username ?? fallbackUsername.value,
  )

  if (!username) {
    throw new Error('Username is required')
  }

  return {
    username,
    display_name: profile.value.display_name ?? '',
    bio: profile.value.bio ?? '',
    avatar_url: profile.value.avatar_url ?? '',
    ...changes,
    username,
  }
}

function showMessage(text, type = 'success') {
  message.value = text
  messageType.value = type

  if (messageTimer) {
    clearTimeout(messageTimer)
  }

  messageTimer = setTimeout(() => {
    message.value = ''
    messageTimer = null
  }, 10000)
}

function clearMessage() {
  message.value = ''
  if (messageTimer) {
    clearTimeout(messageTimer)
    messageTimer = null
  }
}

async function loadProfile() {
  loading.value = true
  clearMessage()

  try {
    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError || !userData?.user) {
      throw userError || new Error('Unable to find logged-in user')
    }

    userId.value = userData.user.id
    const defaultUsername = makeDefaultUsername(userData.user)
    fallbackUsername.value = defaultUsername

    const profileData = await getProfile(userId.value)
    if (!profileData) {
      const created = await upsertProfile(userId.value, {
        username: defaultUsername,
        display_name: '',
        bio: '',
      })
      profile.value = created
    } else {
      profile.value = profileData
    }

    if (profile.value.avatar_url) {
      avatarUrl.value = await getAvatarUrl(profile.value.avatar_url)
    }
  } catch (error) {
    console.error('[profile:load]', error)
    showMessage(error?.message || 'Unable to load profile', 'error')
  } finally {
    loading.value = false
  }
}

function triggerFileInput() {
  fileInput.value?.click()
}

function onFileSelected(event) {
  const file = event.target.files?.[0]
  if (!file) return

  const allowedTypes = ['image/png', 'image/jpeg']
  if (!allowedTypes.includes(file.type)) {
    showMessage('Only PNG and JPEG formats are supported', 'error')
    return
  }

  if (file.size > 10 * 1024 * 1024) {
    showMessage('Image size cannot exceed 10MB', 'error')
    return
  }

  selectedFile.value = file
  croppingOpen.value = true
  event.target.value = ''
}

async function handleAvatarCropped(file) {
  croppingOpen.value = false
  loading.value = true
  clearMessage()

  try {
    if (!userId.value) {
      throw new Error('Unable to find user')
    }

    const avatarPath = await uploadAvatar(userId.value, file)
    const updated = await upsertProfile(
      userId.value,
      buildProfilePayload({
        avatar_url: avatarPath,
      }),
    )
    profile.value = updated
    avatarUrl.value = await getAvatarUrl(avatarPath)
    showMessage('Avatar saved successfully', 'success')
  } catch (error) {
    console.error('[profile:avatar]', error)
    showMessage(error?.message || 'Failed to upload avatar', 'error')
  } finally {
    loading.value = false
  }
}

async function handleFieldSave(field, value) {
  loading.value = true
  clearMessage()

  try {
    if (!userId.value) {
      throw new Error('Unable to find user')
    }

    const nextValue = field === 'username' ? normalizeUsername(value) : value

    const profileUpdate = await upsertProfile(
      userId.value,
      buildProfilePayload({
        [field]: nextValue,
      }),
    )
    profile.value = profileUpdate
    showMessage(
      `${field === 'bio' ? 'Bio' : field === 'display_name' ? 'Display Name' : 'Username'} saved successfully`,
      'success',
    )
  } catch (error) {
    console.error('[profile:save]', error)
    showMessage(error?.message || 'Failed to save profile', 'error')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadProfile()
})

onBeforeUnmount(() => {
  if (messageTimer) {
    clearTimeout(messageTimer)
  }
})
</script>

<template>
  <v-container fluid class="profile-page pa-10">
    <div class="ma-16"></div>
    <section class="profile-header mb-8">
      <h1 class="profile-title text-h3 font-weight-bold mb-3">My Profile</h1>
      <p class="profile-description text-body-1 mb-4">
        View and update your profile, avatar, and personal details.
      </p>
    </section>

    <v-row class="profile-grid" align="start" justify="center" dense>
      <v-col cols="12" md="4">
        <v-card class="avatar-card pa-6 elevation-6">
          <div class="avatar-preview-wrapper">
            <v-avatar class="avatar-circle" size="180">
              <v-img :src="avatarDisplayUrl" alt="Avatar" />
            </v-avatar>
            <v-btn icon class="avatar-upload-button" color="primary" @click="triggerFileInput">
              <v-icon>mdi-camera-plus</v-icon>
            </v-btn>
          </div>

          <div class="avatar-info mt-6">
            <p class="text-subtitle-1 font-weight-medium mb-2">Profile Photo</p>
            <p class="text-body-2 text-secondary">
              PNG or JPEG, up to 10MB. Click the icon to upload and crop as a square avatar.
            </p>
          </div>

          <input
            ref="fileInput"
            type="file"
            accept="image/png, image/jpeg"
            hidden
            @change="onFileSelected"
          />
        </v-card>
      </v-col>

      <v-col cols="12" md="8">
        <v-card class="profile-data-card pa-6 elevation-6">
          <ProfilePageField
            label="Display Name"
            :value="profile.display_name"
            placeholder="Enter your display name"
            @save="handleFieldSave('display_name', $event)"
          />
          <ProfilePageField
            label="Username"
            :value="profile.username"
            placeholder="Enter your username"
            :transform-fn="normalizeUsername"
            :warning-message="usernameWarning"
            @save="handleFieldSave('username', $event)"
          />
          <ProfilePageField
            label="Bio"
            :value="profile.bio"
            placeholder="Write a short bio"
            multiline
            @save="handleFieldSave('bio', $event)"
          />

          <div class="profile-timestamps mt-8">
            <div class="timestamp-item">
              <span class="timestamp-label">Created at</span>
              <span class="timestamp-value">{{ createdAtFormatted }}</span>
            </div>
            <div class="timestamp-item">
              <span class="timestamp-label">Last updated</span>
              <span class="timestamp-value">{{ updatedAtFormatted }}</span>
            </div>
          </div>

          <v-alert v-if="message" :type="messageType" dense class="mt-6">
            {{ message }}
          </v-alert>
        </v-card>
      </v-col>
    </v-row>

    <AvatarCropping
      v-model="croppingOpen"
      :image-file="selectedFile"
      @cropped="handleAvatarCropped"
      @close="croppingOpen = false"
    />

    <v-overlay :value="loading" absolute>
      <v-progress-circular indeterminate size="48" color="primary" />
    </v-overlay>
  </v-container>
</template>

<style scoped>
.profile-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(66, 184, 131, 0.15), transparent 40%), #060a06;
}

.profile-header {
  max-width: 920px;
  margin: 0 auto;
  text-align: left;
}

.profile-title {
  color: #e6f7ec;
}

.profile-description {
  color: #cbd7ca;
}

.avatar-card,
.profile-data-card {
  background: #0f1710;
  border: 1px solid rgba(66, 184, 131, 0.14);
}

.avatar-preview-wrapper {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.avatar-circle {
  border: 3px solid rgba(66, 184, 131, 0.25);
  background: #111911;
}

.avatar-upload-button {
  position: absolute;
  right: -10px;
  bottom: -10px;
  background: #42b883;
  color: #fff;
}

.avatar-info {
  color: #cfd8d1;
}

.profile-timestamps {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

@media (max-width: 600px) {
  .profile-timestamps {
    grid-template-columns: 1fr;
  }
}

.timestamp-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  color: #a8b5aa;
}

@media (max-width: 600px) {
  .timestamp-item {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
  }

  .timestamp-value {
    text-align: right;
  }
}

.timestamp-label {
  font-weight: 600;
  color: #8fbf97;
}

.timestamp-value {
  color: #e5f2dd;
}

.v-overlay__content {
  backdrop-filter: blur(2px);
}
</style>
