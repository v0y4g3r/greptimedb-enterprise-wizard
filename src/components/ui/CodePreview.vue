<script setup lang="ts">
defineProps<{
  code: string
}>()
</script>

<template>
  <div class="relative">
    <pre class="bg-gt-code-bg text-gt-code-text text-sm rounded-lg p-4 overflow-auto max-h-[600px] font-mono whitespace-pre-wrap">{{ code }}</pre>
  </div>
</template>
