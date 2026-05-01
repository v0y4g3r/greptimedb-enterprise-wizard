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
  <div class="min-h-screen bg-gt-bg-primary">
    <!-- Header -->
    <header class="bg-gt-bg-surface shadow-sm border-b border-gt-border">
      <div class="max-w-5xl mx-auto px-6 py-4">
        <h1 class="text-xl font-bold text-gt-purple">GreptimeDB Enterprise Values Configurator</h1>
        <p class="text-sm text-gt-footer mt-1">Configure your Helm chart values.yaml step by step</p>
      </div>
    </header>

    <div class="max-w-5xl mx-auto px-6 py-8">
      <!-- Progress bar -->
      <div class="mb-8">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-medium text-gt-purple">Step {{ currentStep }} of {{ steps.length }}</span>
          <span class="text-sm text-gt-footer">{{ steps[currentStep - 1].title }}</span>
        </div>
        <div class="w-full bg-gt-border rounded-full h-2">
          <div
            class="bg-gt-accent h-2 rounded-full transition-all duration-300"
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
              ? 'bg-gt-accent text-white'
              : step.id < currentStep
              ? 'bg-gt-purple-bg text-gt-accent-dark cursor-pointer hover:bg-gt-accent-lightest'
              : 'bg-gt-border/60 text-gt-muted cursor-default'
          ]"
          @click="goToStep(step.id)"
        >
          {{ step.id }}. {{ step.title }}
        </button>
      </nav>

      <!-- Step content -->
      <div class="bg-gt-bg-surface rounded-lg shadow-sm border border-gt-border p-6">
        <h2 class="text-lg font-semibold text-gt-purple mb-1">{{ steps[currentStep - 1].title }}</h2>
        <p class="text-sm text-gt-footer mb-6">{{ steps[currentStep - 1].description }}</p>

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
