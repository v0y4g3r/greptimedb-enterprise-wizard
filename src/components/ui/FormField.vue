<script setup lang="ts">
defineProps<{
  label: string
  description?: string
  required?: boolean
}>()
</script>

<template>
  <div class="space-y-1">
    <label class="text-sm font-medium text-gray-700">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    <p v-if="description" class="text-xs text-gray-500">{{ description }}</p>
    <slot />
  </div>
</template>
