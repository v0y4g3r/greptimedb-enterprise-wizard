<script setup lang="ts">
import { computed, inject, watch } from 'vue'
import { config } from '../../store/config'
import FormField from '../ui/FormField.vue'

const registryValid = computed(() => {
  return !!(
    config.customImageRegistry.registry.trim() &&
    config.customImageRegistry.username.trim() &&
    config.customImageRegistry.password.trim()
  )
})

const setStepValid = inject<(step: number, valid: boolean) => void>('setStepValid')!
watch(registryValid, (valid) => setStepValid(1, valid), { immediate: true })

function inputClass(filled: boolean): string {
  return filled
    ? 'mt-1 block w-full rounded-md shadow-sm focus:ring-gt-accent sm:text-sm border p-2 border-gt-border focus:border-gt-accent'
    : 'mt-1 block w-full rounded-md shadow-sm focus:ring-gt-accent sm:text-sm border p-2 border-red-300 focus:border-red-500'
}
</script>

<template>
  <div class="space-y-6">
    <div class="space-y-4">
      <FormField label="Helm Namespace" description="Used for generated dashboard service URLs.">
        <input
          v-model="config.clusterNamespace"
          type="text"
          class="mt-1 block w-full rounded-md border-gt-border shadow-sm focus:border-gt-accent focus:ring-gt-accent sm:text-sm border p-2"
          placeholder="default"
        />
      </FormField>
      <FormField label="Helm Release Name" description="Use this as the release name in helm install; Helm does not read release names from values.yaml.">
        <input
          v-model="config.clusterName"
          type="text"
          class="mt-1 block w-full rounded-md border-gt-border shadow-sm focus:border-gt-accent focus:ring-gt-accent sm:text-sm border p-2"
          placeholder="greptimedb"
        />
      </FormField>
    </div>

    <div class="border-t border-gt-border pt-6">
      <h3 class="text-sm font-semibold text-gt-purple mb-1">Image Registry</h3>
      <p class="text-xs text-gt-footer mb-4">Registry credentials used to pull GreptimeDB images. A Kubernetes pull secret will be created automatically.</p>
      <div v-if="!registryValid" class="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800 mb-4">
        All registry fields are required.
      </div>
      <div class="grid grid-cols-3 gap-4">
        <FormField label="Registry URL" required>
          <input
            v-model="config.customImageRegistry.registry"
            type="text"
            :class="inputClass(!!config.customImageRegistry.registry.trim())"
            placeholder="registry.example.com"
          />
        </FormField>
        <FormField label="Username" required>
          <input
            v-model="config.customImageRegistry.username"
            type="text"
            :class="inputClass(!!config.customImageRegistry.username.trim())"
          />
        </FormField>
        <FormField label="Password" required>
          <input
            v-model="config.customImageRegistry.password"
            type="password"
            :class="inputClass(!!config.customImageRegistry.password.trim())"
          />
        </FormField>
      </div>
    </div>

    <div class="border-t border-gt-border pt-6">
      <h3 class="text-sm font-semibold text-gt-purple mb-4">GreptimeDB Image</h3>
      <div class="grid grid-cols-2 gap-4">
        <FormField label="Repository">
          <input
            v-model="config.image.repository"
            type="text"
            class="mt-1 block w-full rounded-md border-gt-border shadow-sm focus:border-gt-accent focus:ring-gt-accent sm:text-sm border p-2"
            placeholder="greptime/greptimedb"
          />
        </FormField>
        <FormField label="Tag">
          <input
            v-model="config.image.tag"
            type="text"
            class="mt-1 block w-full rounded-md border-gt-border shadow-sm focus:border-gt-accent focus:ring-gt-accent sm:text-sm border p-2"
            placeholder="v1.0.1"
          />
        </FormField>
      </div>
    </div>

    <div class="border-t border-gt-border pt-6">
      <h3 class="text-sm font-semibold text-gt-purple mb-4">Initializer Image</h3>
      <div class="grid grid-cols-3 gap-4">
        <FormField label="Registry">
          <input
            v-model="config.initializerImage.registry"
            type="text"
            class="mt-1 block w-full rounded-md border-gt-border shadow-sm focus:border-gt-accent focus:ring-gt-accent sm:text-sm border p-2"
          />
        </FormField>
        <FormField label="Repository">
          <input
            v-model="config.initializerImage.repository"
            type="text"
            class="mt-1 block w-full rounded-md border-gt-border shadow-sm focus:border-gt-accent focus:ring-gt-accent sm:text-sm border p-2"
          />
        </FormField>
        <FormField label="Tag">
          <input
            v-model="config.initializerImage.tag"
            type="text"
            class="mt-1 block w-full rounded-md border-gt-border shadow-sm focus:border-gt-accent focus:ring-gt-accent sm:text-sm border p-2"
          />
        </FormField>
      </div>
    </div>
  </div>
</template>
