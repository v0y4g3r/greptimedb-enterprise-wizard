<script setup lang="ts">
import { computed, inject, watch } from 'vue'
import { config } from '../../store/config'
import FormField from '../ui/FormField.vue'
import ToggleSwitch from '../ui/ToggleSwitch.vue'

const endpointsValid = computed(() => {
  if (!config.wal.remote.enabled) return true
  return config.wal.remote.kafkaBrokerEndpoints.length > 0 &&
    config.wal.remote.kafkaBrokerEndpoints.every(ep => ep.trim() !== '')
})

const setStepValid = inject<(step: number, valid: boolean) => void>('setStepValid')!
watch(endpointsValid, (valid) => setStepValid(5, valid), { immediate: true })

function addBroker() {
  config.wal.remote.kafkaBrokerEndpoints.push('')
}

function removeBroker(index: number) {
  config.wal.remote.kafkaBrokerEndpoints.splice(index, 1)
}

watch(() => config.wal.remote.enabled, (enabled) => {
  if (enabled && config.wal.remote.kafkaBrokerEndpoints.length === 0) {
    config.wal.remote.kafkaBrokerEndpoints.push('')
  }
})
</script>

<template>
  <div class="space-y-6">
    <div class="border border-gt-border rounded-lg p-4">
      <ToggleSwitch
        v-model="config.wal.remote.enabled"
        label="Remote WAL (Apache Kafka)"
        description="Use Kafka as external WAL storage for low RTO and region migration support"
      />
      <div v-if="config.wal.remote.enabled" class="mt-4 space-y-4">
        <div v-if="!endpointsValid" class="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
          At least one non-empty Kafka broker endpoint is required when Remote WAL is enabled.
        </div>
        <FormField label="Kafka Broker Endpoints" required>
          <div v-for="(ep, index) in config.wal.remote.kafkaBrokerEndpoints" :key="index" class="flex items-center gap-2 mt-2">
            <input
              v-model="config.wal.remote.kafkaBrokerEndpoints[index]"
              type="text"
              :class="[
                'block flex-1 rounded-md shadow-sm focus:ring-gt-accent sm:text-sm border p-2',
                !ep.trim() ? 'border-red-300 focus:border-red-500' : 'border-gt-border focus:border-gt-accent'
              ]"
              placeholder="kafka.kafka-cluster.svc.cluster.local:9092"
            />
            <button
              class="text-red-500 hover:text-red-700 text-sm px-2"
              @click="removeBroker(index)"
            >
              Remove
            </button>
          </div>
          <button
            class="mt-2 text-sm text-gt-accent hover:text-gt-accent-hover"
            @click="addBroker"
          >
            + Add broker endpoint
          </button>
        </FormField>
      </div>
    </div>

    <div class="border border-gt-border rounded-lg p-4">
      <ToggleSwitch
        v-model="config.wal.dedicated.enabled"
        label="Dedicated WAL Storage"
        description="Use a separate persistent volume for the local WAL (raft-engine)"
      />
      <div v-if="config.wal.dedicated.enabled" class="mt-4 grid grid-cols-2 gap-4">
        <FormField label="Storage Class Name" description="Leave empty for default">
          <input
            v-model="config.wal.dedicated.storage.storageClassName"
            type="text"
            class="mt-1 block w-full rounded-md border-gt-border shadow-sm focus:border-gt-accent focus:ring-gt-accent sm:text-sm border p-2"
          />
        </FormField>
        <FormField label="Storage Size">
          <input
            v-model="config.wal.dedicated.storage.storageSize"
            type="text"
            class="mt-1 block w-full rounded-md border-gt-border shadow-sm focus:border-gt-accent focus:ring-gt-accent sm:text-sm border p-2"
            placeholder="20Gi"
          />
        </FormField>
      </div>
    </div>

    <div v-if="!config.wal.remote.enabled && !config.wal.dedicated.enabled" class="bg-gt-bg-primary rounded-lg p-4 text-sm text-gt-footer">
      <p>Using the default local WAL with embedded raft-engine. Data is stored alongside the datanode's data volume.</p>
    </div>
  </div>
</template>
