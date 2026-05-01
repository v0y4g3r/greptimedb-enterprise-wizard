<script setup lang="ts">
import { ref, computed, provide } from 'vue'
import { steps } from '../store/config'
import StepNav from './StepNav.vue'

const currentStep = ref(1)

const progress = computed(() => ((currentStep.value - 1) / (steps.length - 1)) * 100)

const stepValid = ref<Record<number, boolean>>({
  1: true,
  2: false,
  3: true,
  4: true,
  5: true,
  6: true,
  7: true,
  8: true,
})

function setStepValid(step: number, valid: boolean) {
  stepValid.value[step] = valid
}

provide('setStepValid', setStepValid)

const canProceed = computed(() => stepValid.value[currentStep.value] ?? true)

function next() {
  if (currentStep.value < steps.length && canProceed.value) {
    currentStep.value++
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

function back() {
  if (currentStep.value > 1) {
    currentStep.value--
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

function goToStep(step: number) {
  if (step <= currentStep.value) {
    currentStep.value = step
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-5xl mx-auto px-6 py-4">
        <h1 class="text-xl font-bold text-gray-900">GreptimeDB Enterprise Values Configurator</h1>
        <p class="text-sm text-gray-500 mt-1">Configure your Helm chart values.yaml step by step</p>
      </div>
    </header>

    <div class="max-w-5xl mx-auto px-6 py-8">
      <!-- Progress bar -->
      <div class="mb-8">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-medium text-gray-700">Step {{ currentStep }} of {{ steps.length }}</span>
          <span class="text-sm text-gray-500">{{ steps[currentStep - 1].title }}</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div
            class="bg-blue-600 h-2 rounded-full transition-all duration-300"
            :style="{ width: progress + '%' }"
          />
        </div>
      </div>

      <!-- Step indicators -->
      <nav class="flex flex-wrap gap-2 mb-8">
        <button
          v-for="step in steps"
          :key="step.id"
          :class="[
            'px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
            step.id === currentStep
              ? 'bg-blue-600 text-white'
              : step.id < currentStep
              ? 'bg-blue-100 text-blue-700 cursor-pointer hover:bg-blue-200'
              : 'bg-gray-100 text-gray-400 cursor-default'
          ]"
          @click="goToStep(step.id)"
        >
          {{ step.id }}. {{ step.title }}
        </button>
      </nav>

      <!-- Step content -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-1">{{ steps[currentStep - 1].title }}</h2>
        <p class="text-sm text-gray-500 mb-6">{{ steps[currentStep - 1].description }}</p>

        <slot :current-step="currentStep" />

        <StepNav
          :current-step="currentStep"
          :total-steps="steps.length"
          :can-proceed="canProceed"
          @back="back"
          @next="next"
        />
      </div>
    </div>
  </div>
</template>
