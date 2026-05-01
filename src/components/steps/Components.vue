<script setup lang="ts">
import { computed, inject, watch } from 'vue'
import { config } from '../../store/config'
import FormField from '../ui/FormField.vue'
import ToggleSwitch from '../ui/ToggleSwitch.vue'

interface Resources {
  requests: { cpu: string; memory: string }
  limits: { cpu: string; memory: string }
}

function isResourcesFilled(r: Resources): boolean {
  return !!(r.requests.cpu && r.requests.memory && r.limits.cpu && r.limits.memory)
}

const frontendValid = computed(() => !config.frontend.enabled || isResourcesFilled(config.frontend.resources))
const metaValid = computed(() => isResourcesFilled(config.meta.resources))
const datanodeValid = computed(() => !config.datanode.enabled || isResourcesFilled(config.datanode.resources))
const flownodeValid = computed(() => !config.flownode.enabled || isResourcesFilled(config.flownode.resources))

const allValid = computed(() => frontendValid.value && metaValid.value && datanodeValid.value && flownodeValid.value)

const setStepValid = inject<(step: number, valid: boolean) => void>('setStepValid')!
watch(allValid, (valid) => setStepValid(2, valid), { immediate: true })

function resourceInputClass(filled: boolean): string {
  return filled
    ? 'mt-1 block w-full rounded-md shadow-sm focus:ring-gt-accent sm:text-sm border p-2 border-gt-border focus:border-gt-accent'
    : 'mt-1 block w-full rounded-md shadow-sm focus:ring-gt-accent sm:text-sm border p-2 border-red-300 focus:border-red-500'
}
</script>

<template>
  <div class="space-y-6">
    <p class="text-sm text-gt-footer">
      Meta is always deployed. Toggle other components and <strong class="text-gt-purple">explicitly set resource requests and limits</strong> for each enabled component.
    </p>
    <div v-if="!allValid" class="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
      All enabled components must have resource requests and limits set before proceeding.
    </div>

    <!-- Frontend -->
    <div class="border border-gt-border rounded-lg p-4">
      <ToggleSwitch
        v-model="config.frontend.enabled"
        label="Frontend"
        description="Stateless access layer for SQL, PromQL, MySQL, PostgreSQL protocols"
      />
      <div v-if="config.frontend.enabled" class="mt-4 space-y-4">
        <FormField label="Replicas">
          <input
            v-model.number="config.frontend.replicas"
            type="number"
            min="1"
            max="10"
            class="mt-1 block w-32 rounded-md border-gt-border shadow-sm focus:border-gt-accent focus:ring-gt-accent sm:text-sm border p-2"
          />
        </FormField>
        <div class="border-t border-gt-border pt-4">
          <h4 class="text-xs font-semibold text-gt-purple mb-3">
            Resources
            <span v-if="!frontendValid" class="text-red-500 ml-1">(required)</span>
          </h4>
          <div class="grid grid-cols-2 gap-4">
            <FormField label="CPU Request" required>
              <input v-model="config.frontend.resources.requests.cpu" type="text" :class="resourceInputClass(!!config.frontend.resources.requests.cpu)" placeholder="e.g. 500m" />
            </FormField>
            <FormField label="Memory Request" required>
              <input v-model="config.frontend.resources.requests.memory" type="text" :class="resourceInputClass(!!config.frontend.resources.requests.memory)" placeholder="e.g. 512Mi" />
            </FormField>
            <FormField label="CPU Limit" required>
              <input v-model="config.frontend.resources.limits.cpu" type="text" :class="resourceInputClass(!!config.frontend.resources.limits.cpu)" placeholder="e.g. 8" />
            </FormField>
            <FormField label="Memory Limit" required>
              <input v-model="config.frontend.resources.limits.memory" type="text" :class="resourceInputClass(!!config.frontend.resources.limits.memory)" placeholder="e.g. 16Gi" />
            </FormField>
          </div>
        </div>
      </div>
    </div>

    <!-- Meta (always enabled) -->
    <div class="border border-gt-border rounded-lg p-4 bg-gt-purple-bg/30">
      <div class="flex items-center justify-between py-3">
        <div>
          <label class="text-sm font-medium text-gt-purple">Meta (Metadata Service)</label>
          <p class="text-xs text-gt-footer mt-0.5">Always deployed — manages catalogs, schemas, tables, and regions</p>
        </div>
        <span class="text-xs bg-gt-accent/10 text-gt-accent px-2 py-1 rounded-full font-medium">Always On</span>
      </div>
      <div class="mt-4 space-y-4">
        <FormField label="Replicas">
          <input
            v-model.number="config.meta.replicas"
            type="number"
            min="1"
            max="5"
            class="mt-1 block w-32 rounded-md border-gt-border shadow-sm focus:border-gt-accent focus:ring-gt-accent sm:text-sm border p-2"
          />
        </FormField>
        <div class="border-t border-gt-border pt-4">
          <h4 class="text-xs font-semibold text-gt-purple mb-3">
            Resources
            <span v-if="!metaValid" class="text-red-500 ml-1">(required)</span>
          </h4>
          <div class="grid grid-cols-2 gap-4">
            <FormField label="CPU Request" required>
              <input v-model="config.meta.resources.requests.cpu" type="text" :class="resourceInputClass(!!config.meta.resources.requests.cpu)" placeholder="e.g. 500m" />
            </FormField>
            <FormField label="Memory Request" required>
              <input v-model="config.meta.resources.requests.memory" type="text" :class="resourceInputClass(!!config.meta.resources.requests.memory)" placeholder="e.g. 512Mi" />
            </FormField>
            <FormField label="CPU Limit" required>
              <input v-model="config.meta.resources.limits.cpu" type="text" :class="resourceInputClass(!!config.meta.resources.limits.cpu)" placeholder="e.g. 2" />
            </FormField>
            <FormField label="Memory Limit" required>
              <input v-model="config.meta.resources.limits.memory" type="text" :class="resourceInputClass(!!config.meta.resources.limits.memory)" placeholder="e.g. 4Gi" />
            </FormField>
          </div>
        </div>
      </div>
    </div>

    <!-- Datanode -->
    <div class="border border-gt-border rounded-lg p-4">
      <ToggleSwitch
        v-model="config.datanode.enabled"
        label="Datanode"
        description="Storage and execution layer — stores table regions and handles reads/writes"
      />
      <div v-if="config.datanode.enabled" class="mt-4 space-y-4">
        <FormField label="Replicas">
          <input
            v-model.number="config.datanode.replicas"
            type="number"
            min="1"
            max="10"
            class="mt-1 block w-32 rounded-md border-gt-border shadow-sm focus:border-gt-accent focus:ring-gt-accent sm:text-sm border p-2"
          />
        </FormField>
        <div class="border-t border-gt-border pt-4">
          <h4 class="text-xs font-semibold text-gt-purple mb-3">
            Resources
            <span v-if="!datanodeValid" class="text-red-500 ml-1">(required)</span>
          </h4>
          <div class="grid grid-cols-2 gap-4">
            <FormField label="CPU Request" required>
              <input v-model="config.datanode.resources.requests.cpu" type="text" :class="resourceInputClass(!!config.datanode.resources.requests.cpu)" placeholder="e.g. 500m" />
            </FormField>
            <FormField label="Memory Request" required>
              <input v-model="config.datanode.resources.requests.memory" type="text" :class="resourceInputClass(!!config.datanode.resources.requests.memory)" placeholder="e.g. 512Mi" />
            </FormField>
            <FormField label="CPU Limit" required>
              <input v-model="config.datanode.resources.limits.cpu" type="text" :class="resourceInputClass(!!config.datanode.resources.limits.cpu)" placeholder="e.g. 8" />
            </FormField>
            <FormField label="Memory Limit" required>
              <input v-model="config.datanode.resources.limits.memory" type="text" :class="resourceInputClass(!!config.datanode.resources.limits.memory)" placeholder="e.g. 16Gi" />
            </FormField>
          </div>
        </div>
        <div class="border-t border-gt-border pt-4">
          <h4 class="text-xs font-semibold text-gt-purple mb-3">Storage</h4>
          <div class="grid grid-cols-3 gap-4">
            <FormField label="Storage Class Name" description="Leave empty for default">
              <input
                v-model="config.datanode.storage.storageClassName"
                type="text"
                class="mt-1 block w-full rounded-md border-gt-border shadow-sm focus:border-gt-accent focus:ring-gt-accent sm:text-sm border p-2"
                placeholder="default"
              />
            </FormField>
            <FormField label="Storage Size">
              <input
                v-model="config.datanode.storage.storageSize"
                type="text"
                class="mt-1 block w-full rounded-md border-gt-border shadow-sm focus:border-gt-accent focus:ring-gt-accent sm:text-sm border p-2"
                placeholder="20Gi"
              />
            </FormField>
            <FormField label="Retain Policy">
              <select
                v-model="config.datanode.storage.storageRetainPolicy"
                class="mt-1 block w-full rounded-md border-gt-border shadow-sm focus:border-gt-accent focus:ring-gt-accent sm:text-sm border p-2"
              >
                <option value="Retain">Retain</option>
                <option value="Delete">Delete</option>
                <option value="Recycle">Recycle</option>
              </select>
            </FormField>
          </div>
        </div>
      </div>
    </div>

    <!-- Flownode -->
    <div class="border border-gt-border rounded-lg p-4">
      <ToggleSwitch
        v-model="config.flownode.enabled"
        label="Flownode"
        description="Optional streaming/continuous computation for flows"
      />
      <div v-if="config.flownode.enabled" class="mt-4 space-y-4">
        <FormField label="Replicas">
          <input
            v-model.number="config.flownode.replicas"
            type="number"
            min="1"
            max="10"
            class="mt-1 block w-32 rounded-md border-gt-border shadow-sm focus:border-gt-accent focus:ring-gt-accent sm:text-sm border p-2"
          />
        </FormField>
        <div class="border-t border-gt-border pt-4">
          <h4 class="text-xs font-semibold text-gt-purple mb-3">
            Resources
            <span v-if="!flownodeValid" class="text-red-500 ml-1">(required)</span>
          </h4>
          <div class="grid grid-cols-2 gap-4">
            <FormField label="CPU Request" required>
              <input v-model="config.flownode.resources.requests.cpu" type="text" :class="resourceInputClass(!!config.flownode.resources.requests.cpu)" placeholder="e.g. 500m" />
            </FormField>
            <FormField label="Memory Request" required>
              <input v-model="config.flownode.resources.requests.memory" type="text" :class="resourceInputClass(!!config.flownode.resources.requests.memory)" placeholder="e.g. 512Mi" />
            </FormField>
            <FormField label="CPU Limit" required>
              <input v-model="config.flownode.resources.limits.cpu" type="text" :class="resourceInputClass(!!config.flownode.resources.limits.cpu)" placeholder="e.g. 2" />
            </FormField>
            <FormField label="Memory Limit" required>
              <input v-model="config.flownode.resources.limits.memory" type="text" :class="resourceInputClass(!!config.flownode.resources.limits.memory)" placeholder="e.g. 4Gi" />
            </FormField>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
