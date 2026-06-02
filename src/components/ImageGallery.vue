<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'

const props = defineProps({
  images: {
    type: Array,
    default: () => [],
  },
  productName: {
    type: String,
    default: 'Product',
  },
})

const currentImageIndex = ref(0)
const fullscreenOpen = ref(false)
const touchStartX = ref(0)

const displayCount = 4
const visibleImages = computed(() => props.images.slice(0, displayCount))
const currentImage = computed(() => props.images[currentImageIndex.value] || null)
const hasMultipleImages = computed(() => props.images.length > 1)

function goToPrevious() {
  currentImageIndex.value =
    (currentImageIndex.value - 1 + props.images.length) % props.images.length
}

function goToNext() {
  currentImageIndex.value = (currentImageIndex.value + 1) % props.images.length
}

function openFullscreen(index) {
  currentImageIndex.value = index
  fullscreenOpen.value = true
}

function closeFullscreen() {
  fullscreenOpen.value = false
}

function handleKeydown(event) {
  if (!fullscreenOpen.value) return

  if (event.key === 'ArrowLeft') {
    event.preventDefault()
    goToPrevious()
  } else if (event.key === 'ArrowRight') {
    event.preventDefault()
    goToNext()
  } else if (event.key === 'Escape') {
    event.preventDefault()
    closeFullscreen()
  }
}

function handleTouchStart(event) {
  touchStartX.value = event.touches[0].clientX
}

function handleTouchEnd(event) {
  const touchEndX = event.changedTouches[0].clientX
  const diff = touchStartX.value - touchEndX

  if (Math.abs(diff) > 50) {
    if (diff > 0) {
      goToNext()
    } else {
      goToPrevious()
    }
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div class="image-gallery">
    <div v-if="!currentImage" class="gallery-empty">
      <v-icon icon="mdi-image-off-outline" size="64" />
      <span>No images available</span>
    </div>

    <div v-else class="gallery-container">
      <!-- Main Image Display -->
      <div class="main-image-wrapper">
        <v-img
          :src="currentImage.url"
          :alt="`${productName} - ${currentImageIndex + 1}`"
          cover
          class="main-image"
          @click="openFullscreen(currentImageIndex)"
        />

        <!-- Navigation Buttons -->
        <v-btn
          v-if="hasMultipleImages"
          icon="mdi-chevron-left"
          color="white"
          variant="flat"
          class="nav-button nav-button-prev"
          size="large"
          @click="goToPrevious"
          aria-label="Previous image"
        />
        <v-btn
          v-if="hasMultipleImages"
          icon="mdi-chevron-right"
          color="white"
          variant="flat"
          class="nav-button nav-button-next"
          size="large"
          @click="goToNext"
          aria-label="Next image"
        />

        <!-- Image Counter -->
        <div class="image-counter">{{ currentImageIndex + 1 }} / {{ props.images.length }}</div>
      </div>

      <!-- Thumbnail Grid -->
      <div v-if="props.images.length" class="thumbnails-grid">
        <div
          v-for="(image, index) in visibleImages"
          :key="index"
          class="thumbnail-item"
          :class="{ active: index === currentImageIndex }"
          @click="openFullscreen(index)"
        >
          <v-img :src="image.url" :alt="`Thumbnail ${index + 1}`" cover />
        </div>
        <div v-if="props.images.length > displayCount" class="thumbnail-more">
          +{{ props.images.length - displayCount }}
        </div>
      </div>
    </div>

    <!-- Fullscreen Dialog -->
    <v-dialog v-model="fullscreenOpen" fullscreen class="fullscreen-gallery">
      <v-card class="fullscreen-card">
        <!-- Close Button -->
        <v-btn
          icon="mdi-close"
          color="white"
          variant="flat"
          class="close-button"
          @click="closeFullscreen"
          aria-label="Close fullscreen"
        />

        <!-- Main Fullscreen Image -->
        <div
          class="fullscreen-image-wrapper"
          @touchstart="handleTouchStart"
          @touchend="handleTouchEnd"
        >
          <v-img :src="currentImage.url" :alt="`${productName} fullscreen`" contain />

          <!-- Fullscreen Navigation -->
          <v-btn
            v-if="hasMultipleImages"
            icon="mdi-chevron-left"
            color="white"
            variant="flat"
            class="fullscreen-nav-button fullscreen-nav-prev"
            size="x-large"
            @click="goToPrevious"
            aria-label="Previous image"
          />
          <v-btn
            v-if="hasMultipleImages"
            icon="mdi-chevron-right"
            color="white"
            variant="flat"
            class="fullscreen-nav-button fullscreen-nav-next"
            size="x-large"
            @click="goToNext"
            aria-label="Next image"
          />
        </div>

        <!-- Fullscreen Image Counter -->
        <div class="fullscreen-counter">
          {{ currentImageIndex + 1 }} / {{ props.images.length }}
        </div>

        <!-- Fullscreen Thumbnails -->
        <div class="fullscreen-thumbnails">
          <div
            v-for="(image, index) in props.images"
            :key="index"
            class="fullscreen-thumbnail"
            :class="{ active: index === currentImageIndex }"
            @click="currentImageIndex = index"
          >
            <v-img :src="image.url" :alt="`Fullscreen thumbnail ${index + 1}`" cover />
          </div>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.image-gallery {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.gallery-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
  height: 100%;
  color: #8b9b8d;
  font-size: 14px;
}

.gallery-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
}

/* Main Image */
.main-image-wrapper {
  position: relative;
  flex: 1;
  min-height: 200px;
  background: #0d1511;
  border: 1px solid rgba(66, 184, 131, 0.18);
  border-radius: 8px;
  overflow: hidden;
}

.main-image {
  width: 100%;
  height: 100%;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.main-image:hover {
  transform: scale(1.02);
}

/* Navigation Buttons */
.nav-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.6) !important;
  z-index: 10;
}

.nav-button-prev {
  left: 8px;
}

.nav-button-next {
  right: 8px;
}

/* Image Counter */
.image-counter {
  position: absolute;
  bottom: 12px;
  right: 12px;
  background: rgba(0, 0, 0, 0.7);
  color: #e7f8ee;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

/* Thumbnails Grid */
.thumbnails-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  height: 100px;
}

.thumbnail-item {
  position: relative;
  border: 2px solid rgba(66, 184, 131, 0.12);
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #0d1511;
}

.thumbnail-item:hover {
  border-color: rgba(66, 184, 131, 0.4);
}

.thumbnail-item.active {
  border-color: #42b883;
  box-shadow: 0 0 8px rgba(66, 184, 131, 0.3);
}

.thumbnail-more {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(66, 184, 131, 0.1);
  border: 1px solid rgba(66, 184, 131, 0.2);
  border-radius: 6px;
  color: #42b883;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.thumbnail-more:hover {
  background: rgba(66, 184, 131, 0.15);
}

/* Fullscreen Dialog */
.fullscreen-card {
  background: #050806;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.close-button {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 100;
  background: rgba(0, 0, 0, 0.6) !important;
}

.fullscreen-image-wrapper {
  position: relative;
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.fullscreen-nav-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.6) !important;
}

.fullscreen-nav-prev {
  left: 20px;
}

.fullscreen-nav-next {
  right: 20px;
}

.fullscreen-counter {
  padding: 12px;
  text-align: center;
  color: #42b883;
  font-size: 13px;
  border-top: 1px solid rgba(66, 184, 131, 0.12);
}

.fullscreen-thumbnails {
  display: flex;
  gap: 8px;
  padding: 12px;
  overflow-x: auto;
  border-top: 1px solid rgba(66, 184, 131, 0.12);
  background: rgba(66, 184, 131, 0.03);
}

.fullscreen-thumbnail {
  min-width: 80px;
  height: 80px;
  border: 2px solid rgba(66, 184, 131, 0.12);
  border-radius: 6px;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.2s ease;
}

.fullscreen-thumbnail:hover {
  border-color: rgba(66, 184, 131, 0.4);
}

.fullscreen-thumbnail.active {
  border-color: #42b883;
  box-shadow: 0 0 8px rgba(66, 184, 131, 0.3);
}

/* Responsive */
@media (max-width: 960px) {
  .thumbnails-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .fullscreen-thumbnails {
    justify-content: center;
  }
}

@media (max-width: 600px) {
  .thumbnails-grid {
    grid-template-columns: repeat(2, 1fr);
    height: 80px;
  }

  .nav-button {
    width: 36px;
    height: 36px;
  }
}
</style>
