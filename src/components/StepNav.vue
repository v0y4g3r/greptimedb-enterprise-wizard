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
  <div class="flex justify-between pt-6 border-t border-gt-border mt-8">
    <button
      v-if="currentStep > 1"
      class="px-4 py-2 text-sm font-medium text-gt-purple bg-gt-bg-surface border border-gt-border rounded-md hover:bg-gt-bg-primary focus:outline-none focus:ring-2 focus:ring-gt-accent"
      @click="$emit('back')"
    >
      Back
    </button>
    <div v-else></div>
    <button
      v-if="currentStep < totalSteps"
      class="px-4 py-2 text-sm font-medium text-white bg-gt-accent border border-transparent rounded-md hover:bg-gt-accent-hover focus:outline-none focus:ring-2 focus:ring-gt-accent disabled:opacity-50 disabled:cursor-not-allowed"
      :disabled="!canProceed"
      @click="$emit('next')"
    >
      Next
    </button>
  </div>
</template>
