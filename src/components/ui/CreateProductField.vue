<script setup>
import { ref, reactive, computed, defineExpose } from 'vue'

const props = defineProps({})

const form = reactive({
  name: '',
  descriptions: '',
  value: 1,
  price: null,
  type: null,
})

// files holds objects: { file, preview, name }
const files = ref([])
const previewIndex = ref(null)

const types = [
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

function handleFiles(e) {
  const inputFiles = Array.from(e.target.files || [])
  const accepted = inputFiles.filter((f) => /image\/(jpeg|jpg|png)/i.test(f.type))
  const limited = accepted.slice(0, 10 - files.value.length)

  const toAppend = limited.map((f) => ({ file: f, preview: URL.createObjectURL(f), name: f.name }))
  files.value = files.value.concat(toAppend)
}

function removeFile(index) {
  const removed = files.value.splice(index, 1)
  if (removed && removed.length) {
    try {
      URL.revokeObjectURL(removed[0].preview)
    } catch {}
  }
  if (previewIndex.value !== null) previewIndex.value = null
}

function openPreview(index) {
  previewIndex.value = index
}

function closePreview() {
  previewIndex.value = null
}

const displayFiles = computed(() => files.value.map((f) => f.name))

function validate() {
  if (!form.name || !form.name.toString().trim()) {
    return { valid: false, message: 'Name is required.' }
  }

  if (form.value == null || Number.isNaN(Number(form.value)) || Number(form.value) < 1) {
    return { valid: false, message: 'Value must be at least 1.' }
  }

  const priceNumber = Number(form.price)
  if (form.price == null || form.price === '' || Number.isNaN(priceNumber) || priceNumber <= 0) {
    return { valid: false, message: 'Price must be a valid RM amount greater than 0.' }
  }

  if (!form.type) {
    return { valid: false, message: 'Product type is required.' }
  }

  return { valid: true }
}

defineExpose({
  getForm: () => ({
    form: { ...form, price: form.price !== null ? Number(Number(form.price).toFixed(2)) : null },
    files: files.value.map((f) => f.file),
  }),
  validate,
})
</script>

<template>
  <div class="create-product-form">
    <v-row>
      <v-col cols="12" md="8">
        <v-text-field label="Name *" v-model="form.name" required outlined color="green" />
        <v-textarea
          label="Descriptions"
          v-model="form.descriptions"
          outlined
          rows="4"
          color="green"
        />
        <v-text-field
          class="number-field"
          label="Value (quantity) *"
          type="number"
          v-model.number="form.value"
          min="1"
          outlined
          color="green"
        />
        <v-text-field
          class="number-field"
          label="Price (RM) *"
          v-model="form.price"
          type="number"
          step="0.01"
          outlined
          color="green"
          prefix="RM"
        />
        <v-select
          :items="types"
          item-title="label"
          item-value="value"
          label="Product Type *"
          v-model="form.type"
          outlined
          color="green"
        />
      </v-col>

      <v-col cols="12" md="4">
        <div>
          <label style="font-weight: 600">Product Photos (up to 10) - jpg, jpeg, png</label>

          <div class="upload-area" @click="$refs.fileInput.click()" role="button">
            <div class="upload-inner">
              <v-icon size="36">mdi-plus</v-icon>
              <div class="upload-hint">Click or drop images here</div>
            </div>
            <input
              ref="fileInput"
              accept="image/png,image/jpeg"
              multiple
              type="file"
              @change="handleFiles"
              style="display: none"
            />
          </div>

          <div v-if="files.length" class="previews">
            <div class="thumb" v-for="(f, idx) in files" :key="idx">
              <img :src="f.preview" @click="openPreview(idx)" />
              <button class="remove-btn" @click.stop.prevent="removeFile(idx)">
                <v-icon small>mdi-close</v-icon>
              </button>
            </div>
          </div>
        </div>
      </v-col>
    </v-row>
    <div style="margin-top: 8px; color: #cbd5c0; font-size: 13px">
      Fields marked with * are required.
    </div>

    <div v-if="previewIndex !== null" class="lightbox" @click.self="closePreview">
      <div class="lightbox-inner">
        <button class="lightbox-close" @click.prevent="closePreview">
          <v-icon>mdi-close</v-icon>
        </button>
        <img :src="files[previewIndex].preview" class="lightbox-image" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.create-product-form {
  color: #fff;
}
.upload-area {
  border: 2px dashed rgba(255, 255, 255, 0.08);
  height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin-top: 8px;
  border-radius: 6px;
}
.upload-inner {
  text-align: center;
  color: #dfeee3;
}
.upload-hint {
  font-size: 13px;
  margin-top: 6px;
}
.previews {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 12px;
}
.thumb {
  width: 80px;
  height: 80px;
  position: relative;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.04);
}
.thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  cursor: pointer;
}
.remove-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 4px;
  color: #fff;
  border: none;
}
.lightbox {
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.4);
  z-index: 2000;
}
.lightbox-inner {
  position: relative;
  background: #071814;
  padding: 8px;
  border-radius: 6px;
  max-width: 70%;
  max-height: 70%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.lightbox-image {
  max-width: 100%;
  max-height: 100%;
  display: block;
}
.lightbox-close {
  position: absolute;
  left: 8px;
  top: 8px;
  background: transparent;
  border: none;
  color: #fff;
}

/* align number input spinner: make spinner invisible but keep layout consistent */
.number-field input[type='number'] {
  appearance: textfield;
  -moz-appearance: textfield;
  padding-right: 12px;
}
.number-field input[type='number']::-webkit-inner-spin-button,
.number-field input[type='number']::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>
