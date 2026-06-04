<script setup>
import { ref, watch, computed, onMounted, onBeforeUnmount } from 'vue'
import { useDisplay } from 'vuetify'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  imageFile: { type: Object, default: null },
})
const emit = defineEmits(['update:modelValue', 'cropped', 'close'])

const { mobile } = useDisplay()

const dialog = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const canvasRef = ref(null)
const imageSrc = ref('')
const image = ref(null)
const imageWidth = ref(0)
const imageHeight = ref(0)
const zoom = ref(1)
const offsetX = ref(0)
const offsetY = ref(0)
const dragging = ref(false)
const pointer = ref({ x: 0, y: 0 })
const cropSize = ref(360)

let objectUrl = ''
let loadId = 0

function updateCropSize() {
  cropSize.value = Math.min(360, window.innerWidth - 32)
}

const baseScale = computed(() => {
  if (!imageWidth.value || !imageHeight.value) return 1
  return Math.max(cropSize.value / imageWidth.value, cropSize.value / imageHeight.value)
})
const displayedWidth = computed(() => imageWidth.value * baseScale.value * zoom.value)
const displayedHeight = computed(() => imageHeight.value * baseScale.value * zoom.value)
const cropImageStyle = computed(() => ({
  width: `${displayedWidth.value}px`,
  height: `${displayedHeight.value}px`,
  transform: `translate(calc(-50% + ${offsetX.value}px), calc(-50% + ${offsetY.value}px))`,
}))

watch(
  () => [props.modelValue, props.imageFile],
  ([isOpen, file]) => {
    if (isOpen && file) loadImage()
  },
  { immediate: true },
)

function loadImage() {
  if (!props.imageFile) return
  const currentLoadId = ++loadId
  imageSrc.value = ''
  image.value = null
  imageWidth.value = 0
  imageHeight.value = 0
  zoom.value = 1
  offsetX.value = 0
  offsetY.value = 0
  if (objectUrl) URL.revokeObjectURL(objectUrl)
  objectUrl = URL.createObjectURL(props.imageFile)
  imageSrc.value = objectUrl
  const img = new Image()
  img.onload = () => {
    if (currentLoadId !== loadId) return
    image.value = img
    imageWidth.value = img.naturalWidth || img.width
    imageHeight.value = img.naturalHeight || img.height
    clampOffsets()
  }
  img.onerror = () => {
    if (currentLoadId === loadId) {
      imageSrc.value = ''
      image.value = null
    }
  }
  img.src = objectUrl
}

function clampOffsets() {
  const maxX = Math.max(0, (displayedWidth.value - cropSize.value) / 2)
  const maxY = Math.max(0, (displayedHeight.value - cropSize.value) / 2)
  offsetX.value = Math.min(maxX, Math.max(-maxX, offsetX.value))
  offsetY.value = Math.min(maxY, Math.max(-maxY, offsetY.value))
}

function onPointerDown(event) {
  dragging.value = true
  pointer.value = { x: event.clientX, y: event.clientY }
  event.currentTarget.setPointerCapture(event.pointerId)
}
function onPointerMove(event) {
  if (!dragging.value) return
  const dx = event.clientX - pointer.value.x
  const dy = event.clientY - pointer.value.y
  pointer.value = { x: event.clientX, y: event.clientY }
  offsetX.value += dx
  offsetY.value += dy
  clampOffsets()
}
function onPointerUp(event) {
  dragging.value = false
  if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
    event.currentTarget.releasePointerCapture(event.pointerId)
  }
}

function closeDialog() {
  emit('update:modelValue', false)
  emit('close')
}
function updateZoom(value) {
  zoom.value = value
  clampOffsets()
}

function saveCrop() {
  if (!image.value) return
  const tempCanvas = document.createElement('canvas')
  const outputSize = 512
  tempCanvas.width = outputSize
  tempCanvas.height = outputSize
  const ctx = tempCanvas.getContext('2d')
  if (!ctx) return
  ctx.fillStyle = '#0b120d'
  ctx.fillRect(0, 0, outputSize, outputSize)
  const dx = offsetX.value + (cropSize.value - displayedWidth.value) / 2
  const dy = offsetY.value + (cropSize.value - displayedHeight.value) / 2
  const sourceSize = cropSize.value / (baseScale.value * zoom.value)
  const sourceX = Math.max(0, -dx / (baseScale.value * zoom.value))
  const sourceY = Math.max(0, -dy / (baseScale.value * zoom.value))
  ctx.drawImage(image.value, sourceX, sourceY, sourceSize, sourceSize, 0, 0, outputSize, outputSize)
  tempCanvas.toBlob((blob) => {
    if (!blob) return
    const file = new File([blob], 'avatar.png', { type: 'image/png' })
    emit('cropped', file)
  }, 'image/png')
}

onMounted(() => {
  updateCropSize()
  window.addEventListener('resize', updateCropSize)
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', updateCropSize)
  if (objectUrl) URL.revokeObjectURL(objectUrl)
})
</script>

<template>
  <v-dialog v-model="dialog" :max-width="mobile ? undefined : 740" :fullscreen="mobile" persistent>
    <template #activator="{ props }"></template>
    <v-card class="avatar-crop-card">
      <v-card-title class="headline">Crop your avatar</v-card-title>
      <v-card-text>
        <div class="crop-layout">
          <div
            class="crop-frame"
            :style="{ width: `${cropSize}px`, height: `${cropSize}px` }"
            @pointerdown="onPointerDown"
            @pointermove="onPointerMove"
            @pointerup="onPointerUp"
            @pointerleave="onPointerUp"
          >
            <img
              v-if="imageSrc"
              :src="imageSrc"
              alt=""
              class="crop-image"
              :style="cropImageStyle"
              draggable="false"
            />
            <canvas ref="canvasRef" :width="cropSize" :height="cropSize" class="crop-canvas" />
            <div v-if="!image" class="crop-placeholder">Loading image...</div>
          </div>
          <div class="crop-controls">
            <p class="crop-description">
              Drag the image and use the zoom bar to crop it into a square avatar.
            </p>
            <v-slider
              v-model="zoom"
              min="1"
              max="2.5"
              step="0.05"
              label="Zoom"
              class="mt-4"
              @update:modelValue="updateZoom"
            />
            <div class="crop-action-buttons mt-6">
              <v-btn color="success" block @click="saveCrop">Save avatar</v-btn>
              <v-btn text color="error" block @click="closeDialog">Cancel</v-btn>
            </div>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.avatar-crop-card {
  background: #0d140e;
  color: #eaf7ea;
}
.crop-layout {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 24px;
  align-items: start;
}
.crop-frame {
  position: relative;
  background: #0b120d;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  touch-action: none;
  cursor: grab;
  user-select: none;
  flex-shrink: 0;
}
.crop-frame:active {
  cursor: grabbing;
}
.crop-image {
  position: absolute;
  top: 50%;
  left: 50%;
  max-width: none;
  object-fit: fill;
  pointer-events: none;
}
.crop-canvas {
  display: none;
}
.crop-frame::after {
  position: absolute;
  inset: 1.5px;
  border: 3px solid rgba(255, 255, 255, 0.85);
  border-radius: 8px;
  content: '';
  pointer-events: none;
}
.crop-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #b8d8b4;
  pointer-events: none;
}
.crop-description {
  color: #b8d8b4;
  line-height: 1.6;
}

.crop-action-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

@media (max-width: 600px) {
  .crop-layout {
    grid-template-columns: 1fr;
    justify-items: center;
  }
  .crop-controls {
    width: 100%;
  }
}
</style>
