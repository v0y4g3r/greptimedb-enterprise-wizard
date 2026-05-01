<script setup lang="ts">
interface RadioOption {
  value: string
  label: string
  description?: string
}

defineProps<{
  modelValue: string
  label: string
  options: RadioOption[]
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <div class="space-y-2">
    <label class="text-sm font-medium text-gt-purple">{{ label }}</label>
    <div class="space-y-2 mt-1">
      <div
        v-for="option in options"
        :key="option.value"
        class="flex items-start"
      >
        <div class="flex items-center h-5">
          <input
            type="radio"
            :value="option.value"
            :checked="modelValue === option.value"
            class="h-4 w-4 border-gt-border text-gt-accent focus:ring-gt-accent"
            @change="$emit('update:modelValue', option.value)"
          />
        </div>
        <div class="ml-3">
          <span class="text-sm font-medium text-gt-purple">{{ option.label }}</span>
          <p v-if="option.description" class="text-xs text-gt-footer">{{ option.description }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
