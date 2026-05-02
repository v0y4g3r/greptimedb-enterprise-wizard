<script setup lang="ts">
import { ref, computed } from 'vue'
import { config } from '../../store/config'
import { generateValuesYaml } from '../../generator/valuesYaml'
import CodePreview from '../ui/CodePreview.vue'

const yaml = computed(() => generateValuesYaml(config))
const copied = ref(false)

function copyToClipboard() {
  navigator.clipboard.writeText(yaml.value).then(() => {
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  })
}

function downloadYaml() {
  const blob = new Blob([yaml.value], { type: 'text/yaml' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'values.yaml'
  a.click()
  URL.revokeObjectURL(url)
}

const summary = computed(() => {
  const items: { label: string; value: string }[] = []
  items.push({ label: 'Helm Release Name', value: config.clusterName })
  items.push({ label: 'Helm Namespace', value: config.clusterNamespace })
  items.push({ label: 'Image', value: `${config.image.repository}:${config.image.tag}` })
  items.push({ label: 'Frontend', value: config.frontend.enabled ? `${config.frontend.replicas} replica(s)` : 'Disabled' })
  items.push({ label: 'Meta', value: `${config.meta.replicas} replica(s)` })
  items.push({ label: 'Meta Backend', value: config.meta.backendStorage.type })
  items.push({ label: 'Datanode', value: config.datanode.enabled ? `${config.datanode.replicas} replica(s), ${config.datanode.storage.storageSize}` : 'Disabled' })
  items.push({ label: 'Flownode', value: config.flownode.enabled ? `${config.flownode.replicas} replica(s)` : 'Disabled' })
  items.push({ label: 'Object Storage', value: config.objectStorage.type === 'none' ? 'Local filesystem' : config.objectStorage.type.toUpperCase() })
  if (config.wal.remote.enabled) items.push({ label: 'Remote WAL', value: 'Kafka' })
  if (config.enterprise.license.enabled) items.push({ label: 'License', value: 'Enabled' })
  if (config.enterprise.auth.enabled) items.push({ label: 'Auth', value: `${config.enterprise.auth.users.length} user(s)` })
  if (config.enterprise.remoteCompaction.enabled) items.push({ label: 'Remote Compaction', value: 'Enabled' })
  if (config.enterprise.dashboard.enabled) items.push({ label: 'Dashboard', value: 'Enabled' })
  if (config.monitoringObservability.grafana.enabled) items.push({ label: 'Grafana', value: 'Enabled' })
  if (config.monitoringObservability.jaeger.enabled) items.push({ label: 'Jaeger', value: 'Enabled' })
  if (config.monitoringObservability.tracing.enabled) items.push({ label: 'Tracing', value: config.monitoringObservability.tracing.endpoint })
  return items
})
</script>

<template>
  <div class="space-y-6">
    <!-- Summary -->
    <div class="bg-gt-bg-primary rounded-lg p-4">
      <h3 class="text-sm font-semibold text-gt-purple mb-3">Configuration Summary</h3>
      <dl class="grid grid-cols-2 gap-x-6 gap-y-2">
        <div v-for="item in summary" :key="item.label" class="flex">
          <dt class="text-xs text-gt-footer w-32 flex-shrink-0">{{ item.label }}</dt>
          <dd class="text-xs font-medium text-gt-purple">{{ item.value }}</dd>
        </div>
      </dl>
    </div>

    <!-- Actions -->
    <div class="flex gap-3">
      <button
        class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gt-accent border border-transparent rounded-md hover:bg-gt-accent-hover focus:outline-none focus:ring-2 focus:ring-gt-accent"
        @click="downloadYaml"
      >
        Download values.yaml
      </button>
      <button
        class="inline-flex items-center px-4 py-2 text-sm font-medium text-gt-purple bg-gt-bg-surface border border-gt-border rounded-md hover:bg-gt-bg-primary focus:outline-none focus:ring-2 focus:ring-gt-accent"
        @click="copyToClipboard"
      >
        {{ copied ? 'Copied!' : 'Copy to clipboard' }}
      </button>
    </div>

    <!-- YAML Preview -->
    <div>
      <h3 class="text-sm font-semibold text-gt-purple mb-3">Generated values.yaml</h3>
      <CodePreview :code="yaml" />
    </div>
  </div>
</template>
