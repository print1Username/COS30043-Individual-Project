<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppButton from '@/components/ui/AppButton.vue'
import { deleteProduct, getProductById, updateProduct } from '@/lib/products'

const route = useRoute()
const router = useRouter()

const product = ref(null)
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const editing = ref(false)
const deleteDialog = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const fileInput = ref(null)
const previewImage = ref(null)

const form = reactive({
  name: '',
  descriptions: '',
  value: 1,
  price: '',
  type: null,
})

const existingImages = ref([])
const removedImagePaths = ref([])
const newImages = ref([])

const productTypes = [
  { label: 'Food & Beverage', value: 'food_and_beverage' },
  { label: 'Tools & Equipment', value: 'tools_and_equipment' },
  { label: 'Furniture & Home Goods', value: 'furniture_and_home_goods' },
  { label: 'Clothing & Wearables', value: 'clothing_and_wearables' },
  { label: 'Raw Materials', value: 'raw_materials' },
  { label: 'Components & Parts', value: 'components_and_parts' },
  { label: 'Structures', value: 'structures' },
  { label: 'Entertainment & Hobby', value: 'entertainment_and_hobby' },
  { label: 'Medical & Health', value: 'medical_and_health' },
  { label: 'Personal Care & Cosmetics', value: 'personal_care_and_cosmetics' },
  { label: 'Containers & Storage', value: 'containers_and_storage' },
]

const imageCount = computed(() => existingImages.value.length + newImages.value.length)
const canAddImages = computed(() => editing.value && imageCount.value < 10)
const productId = computed(() => route.params.id)
const deleteButtonLabel = computed(() => {
  return `Delete`
})

function formatDate(value) {
  if (!value) return 'Not available'

  return new Intl.DateTimeFormat('en-MY', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function formatType(value) {
  return productTypes.find((item) => item.value === value)?.label || 'Uncategorized'
}

function setFormFromProduct(nextProduct) {
  form.name = nextProduct?.name || ''
  form.descriptions = nextProduct?.descriptions || ''
  form.value = nextProduct?.value ?? 1
  form.price = nextProduct?.price ?? ''
  form.type = nextProduct?.type || null
  existingImages.value = (nextProduct?.image_paths || []).map((path, index) => ({
    path,
    url: nextProduct?.image_urls?.[index] || '',
  }))
  removedImagePaths.value = []
  clearNewImages()
}

async function loadProduct() {
  loading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const data = await getProductById(productId.value)
    product.value = data
    setFormFromProduct(data)
  } catch (error) {
    console.error('[products:details] load error', error)
    errorMessage.value = error?.message || 'Unable to load this product.'
    product.value = null
  } finally {
    loading.value = false
  }
}

function validateForm() {
  if (!form.name?.toString().trim()) {
    return 'Name is required.'
  }

  if (form.value == null || Number.isNaN(Number(form.value)) || Number(form.value) < 1) {
    return 'Value must be at least 1.'
  }

  const priceNumber = Number(form.price)
  if (form.price == null || form.price === '' || Number.isNaN(priceNumber) || priceNumber <= 0) {
    return 'Price must be a valid RM amount greater than 0.'
  }

  if (!form.type) {
    return 'Product type is required.'
  }

  return ''
}

function startEditing() {
  editing.value = true
  errorMessage.value = ''
  successMessage.value = ''
}

function clearNewImages() {
  newImages.value.forEach((item) => {
    try {
      URL.revokeObjectURL(item.url)
    } catch {}
  })
  newImages.value = []
}

function cancelEditing() {
  if (product.value) {
    setFormFromProduct(product.value)
  }

  editing.value = false
  errorMessage.value = ''
  successMessage.value = 'Changes cancelled.'
}

function openFilePicker() {
  if (!canAddImages.value) return
  fileInput.value?.click()
}

function addImages(event) {
  const files = Array.from(event.target.files || [])
  const availableSlots = Math.max(10 - imageCount.value, 0)
  const accepted = files
    .filter((file) => file.type.startsWith('image/'))
    .slice(0, availableSlots)
    .map((file) => ({
      file,
      name: file.name,
      url: URL.createObjectURL(file),
    }))

  newImages.value = [...newImages.value, ...accepted]
  event.target.value = ''
}

function removeExistingImage(index) {
  if (!editing.value) return

  const [removed] = existingImages.value.splice(index, 1)
  if (removed?.path) {
    removedImagePaths.value = [...removedImagePaths.value, removed.path]
  }
}

function removeNewImage(index) {
  if (!editing.value) return

  const [removed] = newImages.value.splice(index, 1)
  if (removed?.url) {
    try {
      URL.revokeObjectURL(removed.url)
    } catch {}
  }
}

function showPreview(url) {
  previewImage.value = url
}

async function saveProduct() {
  const validationMessage = validateForm()
  if (validationMessage) {
    errorMessage.value = validationMessage
    successMessage.value = ''
    return
  }

  saving.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const updatedProduct = await updateProduct({
      id: productId.value,
      payload: {
        name: form.name.trim(),
        descriptions: form.descriptions,
        value: form.value,
        price: form.price,
        type: form.type,
      },
      existingImagePaths: existingImages.value.map((item) => item.path),
      newFiles: newImages.value.map((item) => item.file),
      deletedImagePaths: removedImagePaths.value,
    })

    product.value = updatedProduct
    setFormFromProduct(updatedProduct)
    editing.value = false
    successMessage.value = 'Product saved successfully.'
  } catch (error) {
    console.error('[products:details] save error', error)
    errorMessage.value = error?.message || 'Unable to save product.'
  } finally {
    saving.value = false
  }
}

function openDeleteDialog() {
  deleteDialog.value = true
}

function closeDeleteDialog() {
  if (deleting.value) return
  deleteDialog.value = false
}

async function confirmDelete() {
  deleting.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    await deleteProduct(productId.value)
    deleteDialog.value = false
    editing.value = false
    successMessage.value = 'Product deleted successfully.'
    await router.push('/dashboard/products')
  } catch (error) {
    console.error('[products:details] delete error', error)
    errorMessage.value = error?.message || 'Unable to delete product.'
  } finally {
    deleting.value = false
  }
}

watch(productId, () => {
  editing.value = false
  deleteDialog.value = false
  loadProduct()
})

onMounted(() => {
  loadProduct()
})

onBeforeUnmount(() => {
  clearNewImages()
})
</script>

<template>
  <v-container fluid class="details-page">
    <section class="details-shell">
      <header class="details-header">
        <div class="details-title-group">
          <AppButton
            iconType="icon"
            icon="mdi-arrow-left"
            to="/dashboard/products"
            color="primary"
            variant="tonal"
            rounded="md"
            aria-label="Back to products"
          />
          <div>
            <p class="text-overline text-primary mb-1">Products</p>
            <h1 class="text-h4 font-weight-bold">Product Details</h1>
          </div>
        </div>

        <v-btn
          v-if="product && !editing"
          color="primary"
          variant="flat"
          prepend-icon="mdi-pencil"
          rounded="md"
          @click="startEditing"
        >
          Edit
        </v-btn>
      </header>

      <v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-4">
        {{ errorMessage }}
      </v-alert>
      <v-alert v-if="successMessage" type="success" variant="tonal" class="mb-4">
        {{ successMessage }}
      </v-alert>

      <v-skeleton-loader v-if="loading" type="image, article, actions" class="details-loader" />

      <v-alert v-else-if="!product" type="warning" variant="tonal">
        Product not found, or you do not have permission to view it.
      </v-alert>

      <div v-else class="details-grid">
        <section class="images-panel">
          <div class="panel-heading">
            <div>
              <h2>Images</h2>
              <p>{{ imageCount }} / 10</p>
            </div>
            <v-btn
              :disabled="!canAddImages || saving"
              color="primary"
              variant="tonal"
              prepend-icon="mdi-image-plus"
              rounded="md"
              @click="openFilePicker"
            >
              Add
            </v-btn>
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              multiple
              class="hidden-input"
              @change="addImages"
            />
          </div>

          <div v-if="imageCount" class="image-grid">
            <div v-for="(image, index) in existingImages" :key="image.path" class="image-tile">
              <v-img
                :src="image.url"
                :alt="`${form.name} image ${index + 1}`"
                cover
                class="image-thumb"
                @click="showPreview(image.url)"
              />
              <v-btn
                v-if="editing"
                icon="mdi-delete"
                size="small"
                color="error"
                variant="flat"
                class="image-remove"
                aria-label="Delete image"
                @click.stop="removeExistingImage(index)"
              />
            </div>

            <div v-for="(image, index) in newImages" :key="image.url" class="image-tile">
              <v-img
                :src="image.url"
                :alt="image.name"
                cover
                class="image-thumb"
                @click="showPreview(image.url)"
              />
              <v-chip size="x-small" color="primary" variant="flat" class="image-new">New</v-chip>
              <v-btn
                v-if="editing"
                icon="mdi-delete"
                size="small"
                color="error"
                variant="flat"
                class="image-remove"
                aria-label="Remove new image"
                @click.stop="removeNewImage(index)"
              />
            </div>
          </div>

          <div v-else class="empty-images">
            <v-icon icon="mdi-image-off-outline" size="44" />
            <span>No product images</span>
          </div>
        </section>

        <section class="form-panel">
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-if="editing"
                v-model="form.name"
                label="Name"
                color="primary"
                variant="outlined"
              />
              <div v-else class="static-field">
                <span class="static-label">Name</span>
                <p class="static-value">{{ form.name || '-' }}</p>
              </div>
            </v-col>

            <v-col cols="12">
              <v-textarea
                v-if="editing"
                v-model="form.descriptions"
                label="Descriptions"
                color="primary"
                variant="outlined"
                rows="5"
              />
              <div v-else class="static-field">
                <span class="static-label">Descriptions</span>
                <p class="static-value pre-wrap">{{ form.descriptions || '-' }}</p>
              </div>
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-if="editing"
                v-model.number="form.value"
                label="Value"
                type="number"
                min="1"
                color="primary"
                variant="outlined"
              />
              <div v-else class="static-field">
                <span class="static-label">Value</span>
                <p class="static-value">{{ form.value || '1' }} pc</p>
              </div>
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-if="editing"
                v-model="form.price"
                label="Price"
                type="number"
                step="0.01"
                prefix="RM"
                color="primary"
                variant="outlined"
              />
              <div v-else class="static-field">
                <span class="static-label">Price</span>
                <p class="static-value">
                  RM {{ form.price ? Number(form.price).toFixed(2) : '0.00' }}
                </p>
              </div>
            </v-col>

            <v-col cols="12">
              <v-select
                v-if="editing"
                v-model="form.type"
                :items="productTypes"
                item-title="label"
                item-value="value"
                label="Product Type"
                color="primary"
                variant="outlined"
              />
              <div v-else class="static-field">
                <span class="static-label">Product Type</span>
                <p class="static-value">{{ formatType(form.type) }}</p>
              </div>
            </v-col>

            <v-col cols="12" md="6">
              <div class="static-field">
                <span class="static-label">Created At</span>
                <p class="static-value">{{ formatDate(product.created_at) }}</p>
              </div>
            </v-col>

            <v-col cols="12" md="6">
              <div class="static-field">
                <span class="static-label">Updated At</span>
                <p class="static-value">{{ formatDate(product.update_at) }}</p>
              </div>
            </v-col>
          </v-row>

          <div v-if="!editing" class="readonly-summary pt-5">
            <v-icon icon="mdi-lock-outline" size="18" />
            <span>Click Edit to change {{ formatType(product.type) }} product details.</span>
          </div>
        </section>
      </div>
    </section>

    <div v-if="product && editing" class="floating-actions">
      <v-btn
        color="error"
        variant="flat"
        prepend-icon="mdi-delete"
        :disabled="saving || deleting"
        @click="openDeleteDialog"
      >
        {{ deleteButtonLabel }}
      </v-btn>
      <v-spacer />
      <v-btn
        variant="text"
        color="white"
        prepend-icon="mdi-close"
        :disabled="saving || deleting"
        @click="cancelEditing"
      >
        Cancel
      </v-btn>
      <v-btn
        color="primary"
        variant="flat"
        prepend-icon="mdi-content-save"
        :loading="saving"
        :disabled="deleting"
        @click="saveProduct"
      >
        Save
      </v-btn>
    </div>

    <v-dialog v-model="deleteDialog" max-width="520">
      <v-card class="delete-dialog">
        <v-card-title class="text-h6 font-weight-bold">Delete product?</v-card-title>
        <v-card-text>
          <p class="mb-3">
            This will permanently remove <strong>{{ product?.name }}</strong> from the products
            table.
          </p>
          <p class="text-body-2 text-medium-emphasis">
            The database trigger will also record this action in the history table.
          </p>
        </v-card-text>
        <v-card-actions class="justify-end ga-2">
          <v-btn variant="text" :disabled="deleting" @click="closeDeleteDialog">Cancel</v-btn>
          <v-btn color="error" variant="flat" :loading="deleting" @click="confirmDelete">
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="previewImage" max-width="860">
      <v-card class="preview-card">
        <v-img :src="previewImage" max-height="76vh" contain />
      </v-card>
    </v-dialog>
  </v-container>
</template>

<style scoped>
.details-page {
  min-height: 100vh;
  padding: 104px 32px 96px;
  background:
    radial-gradient(circle at top left, rgba(66, 184, 131, 0.14), transparent 34%), #050806;
  color: #e7f8ee;
}

.static-field {
  display: flex;
  flex-direction: column;
  padding: 10px 16px;
  background: rgba(66, 184, 131, 0.03);
  border: 1px solid rgba(66, 184, 131, 0.12);
  border-radius: 8px;
  min-height: 56px;
  cursor: default !important;
}

.static-label {
  font-size: 12px;
  color: #42b883;
  font-weight: 500;
  margin-bottom: 2px;
  cursor: default !important;
}

.static-value {
  font-size: 15px;
  color: #e7f8ee;
  margin: 0;
  line-height: 1.4;
  cursor: default !important;
}

.static-value.pre-wrap {
  white-space: pre-wrap;
}

.details-shell {
  width: 100%;
  max-width: 1180px;
  margin: 0 auto;
}

.details-header,
.details-title-group,
.panel-heading,
.floating-actions,
.readonly-summary {
  display: flex;
  align-items: center;
}

.details-header {
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 24px;
}

.details-title-group {
  gap: 14px;
}

.details-grid {
  display: grid;
  grid-template-columns: minmax(300px, 0.82fr) minmax(0, 1.18fr);
  gap: 22px;
}

.images-panel,
.form-panel,
.details-loader {
  border: 1px solid rgba(66, 184, 131, 0.18);
  border-radius: 8px;
  background: #0d1511;
  box-shadow: 0 18px 42px rgba(0, 0, 0, 0.24);
}

.images-panel,
.form-panel {
  padding: 20px;
}

.panel-heading {
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.panel-heading h2 {
  font-size: 20px;
}

.panel-heading p {
  color: #9fb3a7;
  font-size: 13px;
}

.hidden-input {
  display: none;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.image-tile {
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(66, 184, 131, 0.2);
  border-radius: 8px;
  background: #101d17;
  aspect-ratio: 1;
}

.image-thumb {
  width: 100%;
  height: 100%;
  cursor: zoom-in;
}

.image-remove {
  position: absolute;
  top: 8px;
  right: 8px;
}

.image-new {
  position: absolute;
  left: 8px;
  top: 8px;
}

.empty-images {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  min-height: 280px;
  gap: 10px;
  border: 1px dashed rgba(66, 184, 131, 0.28);
  border-radius: 8px;
  color: #80cba8;
  background: #0a100d;
}

.readonly-summary {
  gap: 8px;
  color: #9fb3a7;
  font-size: 14px;
}

.floating-actions {
  position: fixed;
  right: 28px;
  bottom: 28px;
  z-index: 20;
  gap: 10px;
  padding: 10px;
  border: 1px solid rgba(66, 184, 131, 0.22);
  border-radius: 8px;
  background: rgba(7, 24, 20, 0.94);
  box-shadow: 0 16px 42px rgba(0, 0, 0, 0.42);
}

.delete-dialog {
  overflow: hidden;
  border: 1px solid rgba(66, 184, 131, 0.18);
  background: #0d1511;
  color: #e7f8ee;
}

.preview-card {
  overflow: hidden;
  border-radius: 8px;
  background: #071814;
}

@media (max-width: 900px) {
  .details-page {
    padding: 92px 18px 108px;
  }

  .details-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .details-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .image-grid {
    grid-template-columns: 1fr;
  }

  .floating-actions {
    right: 14px;
    bottom: 14px;
    left: 14px;
    justify-content: flex-end;
    flex-wrap: wrap;
  }
}
</style>
