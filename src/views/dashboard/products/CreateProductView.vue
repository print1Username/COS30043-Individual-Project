<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AppButton from '@/components/ui/AppButton.vue'
import CreateProductField from '@/components/ui/CreateProductField.vue'
import { createProduct } from '@/lib/products'

const router = useRouter()
const fieldRef = ref(null)
const errorMessage = ref('')
const errorType = ref('warning')
const creating = ref(false)

const onCancel = () => {
  router.push('/dashboard/products')
}

const onSave = async () => {
  if (!fieldRef.value) return

  const validation = fieldRef.value.validate()
  if (!validation.valid) {
    errorMessage.value = validation.message
    errorType.value = 'warning'
    return
  }

  const { form, files } = fieldRef.value.getForm()
  errorMessage.value = ''
  creating.value = true

  try {
    await createProduct({ ...form }, files)
    router.push('/dashboard/products')
  } catch (err) {
    console.error('[products:create] ', err)
    errorMessage.value = err?.message || 'Unable to save product. Please try again.'
    errorType.value = 'error'
  } finally {
    creating.value = false
  }
}
</script>

<template>
  <v-container
    fluid
    class="dashboard-page"
    style="background: linear-gradient(180deg, #0f5132, #000); color: #fff"
  >
    <section class="dashboard-content">
      <v-card
        class="product-card pa-6"
        elevation="2"
        style="background: #071814; color: #fff; margin-top: 48px"
      >
        <div
          class="card-header"
          style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px"
        >
          <AppButton
            iconType="icon"
            icon="mdi-arrow-left"
            :to="'/dashboard/products'"
            color="white"
            variant="flat"
            :iconSize="28"
          />
          <div>
            <p class="text-overline text-primary mb-1">Products</p>
            <h2 class="product-heading">Create Product</h2>
          </div>
        </div>

        <CreateProductField ref="fieldRef" />

        <div
          class="card-footer"
          style="
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-top: 20px;
          "
        >
          <div
            v-if="errorMessage"
            :class="['error-box', errorType === 'warning' ? 'warning' : 'error']"
          >
            {{ errorMessage }}
          </div>
          <div class="justify-end" style="margin-left: auto">
            <v-btn
              variant="flat"
              color="white"
              style="background: transparent; color: white"
              @click="onCancel"
            >
              Cancel
            </v-btn>
            <v-btn
              :color="creating ? '#7cccb7' : '#3eaf7c'"
              class="ml-2"
              :disabled="creating"
              @click="onSave"
              >{{ creating ? 'Creating...' : 'Create' }}</v-btn
            >
          </div>
        </div>
      </v-card>
    </section>
  </v-container>
</template>

<style scoped>
.dashboard-page {
  min-height: 100vh;
  padding: 24px;
}
.dashboard-content {
  max-width: 1000px;
  margin: 0 auto;
}
.product-heading {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
}
.product-card {
  border-radius: 8px;
}
.error-box {
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 14px;
  line-height: 1.4;
  max-width: 420px;
}
.error-box.warning {
  background: #553c00;
  color: #fff9d4;
  border: 1px solid #e5b500;
}
.error-box.error {
  background: #5f1f1f;
  color: #ffd6d6;
  border: 1px solid #d32f2f;
}
</style>
