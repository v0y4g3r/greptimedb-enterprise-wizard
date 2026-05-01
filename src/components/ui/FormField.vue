<script setup lang="ts">
defineProps<{
  label: string
  description?: string
  required?: boolean
}>()
</script>

<template>
  <div class="space-y-1">
    <label class="text-sm font-medium text-gt-purple">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    <p v-if="description" class="text-xs text-gt-footer">{{ description }}</p>
    <slot />
  </div>
</template>
