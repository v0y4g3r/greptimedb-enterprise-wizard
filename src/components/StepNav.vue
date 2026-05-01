<script setup lang="ts">
defineProps<{
  currentStep: number
  totalSteps: number
  canProceed: boolean
}>()

defineEmits<{
  back: []
  next: []
}>()
</script>

<template>
  <div class="flex justify-between pt-6 border-t border-gray-200 mt-8">
    <button
      v-if="currentStep > 1"
      class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      @click="$emit('back')"
    >
      Back
    </button>
    <div v-else></div>
    <button
      v-if="currentStep < totalSteps"
      class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      :disabled="!canProceed"
      @click="$emit('next')"
    >
      Next
    </button>
  </div>
</template>
