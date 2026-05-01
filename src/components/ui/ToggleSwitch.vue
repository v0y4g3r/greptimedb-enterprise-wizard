<script setup lang="ts">
defineProps<{
  modelValue: boolean
  label: string
  description?: string
}>()

defineEmits<{
  'update:modelValue': [value: boolean]
}>()
</script>

<template>
  <div class="flex items-center justify-between py-3">
    <div>
      <label class="text-sm font-medium text-gray-700">{{ label }}</label>
      <p v-if="description" class="text-xs text-gray-500 mt-0.5">{{ description }}</p>
    </div>
    <button
      type="button"
      :class="[
        modelValue ? 'bg-blue-600' : 'bg-gray-200',
        'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
      ]"
      @click="$emit('update:modelValue', !modelValue)"
    >
      <span
        :class="[
          modelValue ? 'translate-x-5' : 'translate-x-0',
          'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out mt-0.5 ml-0.5'
        ]"
      />
    </button>
  </div>
</template>
