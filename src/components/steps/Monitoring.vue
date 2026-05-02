<script setup lang="ts">
import { config } from '../../store/config'
import FormField from '../ui/FormField.vue'
import RadioGroup from '../ui/RadioGroup.vue'
import ToggleSwitch from '../ui/ToggleSwitch.vue'
</script>

<template>
  <div class="space-y-6">
    <!-- Monitoring Standalone -->
    <div class="border border-gt-border rounded-lg p-4">
      <ToggleSwitch
        v-model="config.monitoringObservability.monitoring.enabled"
        label="Monitoring Standalone"
        description="Deploy a standalone GreptimeDB instance to collect monitoring data (metrics, logs)"
      />
      <div v-if="config.monitoringObservability.monitoring.enabled" class="mt-4 space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <FormField label="CPU">
            <input
              v-model="config.monitoringObservability.monitoring.resources.cpu"
              type="text"
              class="mt-1 block w-full rounded-md border-gt-border shadow-sm focus:border-gt-accent focus:ring-gt-accent sm:text-sm border p-2"
              placeholder="500m"
            />
          </FormField>
          <FormField label="Memory">
            <input
              v-model="config.monitoringObservability.monitoring.resources.memory"
              type="text"
              class="mt-1 block w-full rounded-md border-gt-border shadow-sm focus:border-gt-accent focus:ring-gt-accent sm:text-sm border p-2"
              placeholder="512Mi"
            />
          </FormField>
        </div>

        <!-- Object Storage -->
        <div class="border-t border-gt-border pt-4">
          <h4 class="text-xs font-semibold text-gt-purple mb-3">Object Storage</h4>
          <RadioGroup
            v-model="config.monitoringObservability.monitoring.objectStorage.type"
            label="Storage Backend"
            description="Choose object storage for the monitoring standalone"
            :options="[
              { value: 'none', label: 'Local Filesystem', description: 'No object storage (for development/testing)' },
              { value: 's3', label: 'AWS S3 / S3-compatible', description: 'Amazon S3, MinIO, or other S3-compatible storage' },
              { value: 'gcs', label: 'Google Cloud Storage', description: 'GCS bucket for data storage' },
              { value: 'azblob', label: 'Azure Blob Storage', description: 'Azure Blob container for data storage' },
              { value: 'oss', label: 'Alibaba Cloud OSS', description: 'Alibaba Cloud Object Storage Service' },
            ]"
          />

          <!-- S3 -->
          <div v-if="config.monitoringObservability.monitoring.objectStorage.type === 's3'" class="mt-4 space-y-3">
            <div class="grid grid-cols-2 gap-4">
              <FormField label="Bucket" required>
                <input v-model="config.monitoringObservability.monitoring.objectStorage.s3.bucket" type="text"
                  class="mt-1 block w-full rounded-md border-gt-border shadow-sm focus:border-gt-accent focus:ring-gt-accent sm:text-sm border p-2" placeholder="monitoring" />
              </FormField>
              <FormField label="Region">
                <input v-model="config.monitoringObservability.monitoring.objectStorage.s3.region" type="text"
                  class="mt-1 block w-full rounded-md border-gt-border shadow-sm focus:border-gt-accent focus:ring-gt-accent sm:text-sm border p-2" placeholder="us-west-2" />
              </FormField>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <FormField label="Root Path" description="Optional prefix within the bucket">
                <input v-model="config.monitoringObservability.monitoring.objectStorage.s3.root" type="text"
                  class="mt-1 block w-full rounded-md border-gt-border shadow-sm focus:border-gt-accent focus:ring-gt-accent sm:text-sm border p-2" />
              </FormField>
              <FormField label="Endpoint" description="For S3-compatible services">
                <input v-model="config.monitoringObservability.monitoring.objectStorage.s3.endpoint" type="text"
                  class="mt-1 block w-full rounded-md border-gt-border shadow-sm focus:border-gt-accent focus:ring-gt-accent sm:text-sm border p-2" placeholder="https://minio.example.com" />
              </FormField>
            </div>
            <ToggleSwitch v-model="config.monitoringObservability.monitoring.objectStorage.s3.enableVirtualHostStyle"
              label="Enable Virtual Host Style" description="Use virtual host style URLs instead of path style" />
          </div>

          <!-- GCS -->
          <div v-if="config.monitoringObservability.monitoring.objectStorage.type === 'gcs'" class="mt-4 space-y-3">
            <div class="grid grid-cols-2 gap-4">
              <FormField label="Bucket" required>
                <input v-model="config.monitoringObservability.monitoring.objectStorage.gcs.bucket" type="text"
                  class="mt-1 block w-full rounded-md border-gt-border shadow-sm focus:border-gt-accent focus:ring-gt-accent sm:text-sm border p-2" />
              </FormField>
              <FormField label="Scope">
                <input v-model="config.monitoringObservability.monitoring.objectStorage.gcs.scope" type="text"
                  class="mt-1 block w-full rounded-md border-gt-border shadow-sm focus:border-gt-accent focus:ring-gt-accent sm:text-sm border p-2" />
              </FormField>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <FormField label="Root Path">
                <input v-model="config.monitoringObservability.monitoring.objectStorage.gcs.root" type="text"
                  class="mt-1 block w-full rounded-md border-gt-border shadow-sm focus:border-gt-accent focus:ring-gt-accent sm:text-sm border p-2" />
              </FormField>
              <FormField label="Endpoint">
                <input v-model="config.monitoringObservability.monitoring.objectStorage.gcs.endpoint" type="text"
                  class="mt-1 block w-full rounded-md border-gt-border shadow-sm focus:border-gt-accent focus:ring-gt-accent sm:text-sm border p-2" />
              </FormField>
            </div>
          </div>

          <!-- Azure Blob -->
          <div v-if="config.monitoringObservability.monitoring.objectStorage.type === 'azblob'" class="mt-4 space-y-3">
            <div class="grid grid-cols-2 gap-4">
              <FormField label="Container" required>
                <input v-model="config.monitoringObservability.monitoring.objectStorage.azblob.container" type="text"
                  class="mt-1 block w-full rounded-md border-gt-border shadow-sm focus:border-gt-accent focus:ring-gt-accent sm:text-sm border p-2" />
              </FormField>
              <FormField label="Endpoint">
                <input v-model="config.monitoringObservability.monitoring.objectStorage.azblob.endpoint" type="text"
                  class="mt-1 block w-full rounded-md border-gt-border shadow-sm focus:border-gt-accent focus:ring-gt-accent sm:text-sm border p-2" />
              </FormField>
            </div>
            <FormField label="Root Path">
              <input v-model="config.monitoringObservability.monitoring.objectStorage.azblob.root" type="text"
                class="mt-1 block w-full rounded-md border-gt-border shadow-sm focus:border-gt-accent focus:ring-gt-accent sm:text-sm border p-2" />
            </FormField>
          </div>

          <!-- OSS -->
          <div v-if="config.monitoringObservability.monitoring.objectStorage.type === 'oss'" class="mt-4 space-y-3">
            <div class="grid grid-cols-2 gap-4">
              <FormField label="Bucket" required>
                <input v-model="config.monitoringObservability.monitoring.objectStorage.oss.bucket" type="text"
                  class="mt-1 block w-full rounded-md border-gt-border shadow-sm focus:border-gt-accent focus:ring-gt-accent sm:text-sm border p-2" />
              </FormField>
              <FormField label="Region">
                <input v-model="config.monitoringObservability.monitoring.objectStorage.oss.region" type="text"
                  class="mt-1 block w-full rounded-md border-gt-border shadow-sm focus:border-gt-accent focus:ring-gt-accent sm:text-sm border p-2" />
              </FormField>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <FormField label="Root Path">
                <input v-model="config.monitoringObservability.monitoring.objectStorage.oss.root" type="text"
                  class="mt-1 block w-full rounded-md border-gt-border shadow-sm focus:border-gt-accent focus:ring-gt-accent sm:text-sm border p-2" />
              </FormField>
              <FormField label="Endpoint">
                <input v-model="config.monitoringObservability.monitoring.objectStorage.oss.endpoint" type="text"
                  class="mt-1 block w-full rounded-md border-gt-border shadow-sm focus:border-gt-accent focus:ring-gt-accent sm:text-sm border p-2" />
              </FormField>
            </div>
          </div>

          <!-- Secret Name (for all cloud providers) -->
          <div v-if="config.monitoringObservability.monitoring.objectStorage.type !== 'none'" class="mt-4">
            <FormField label="Secret Name" description="Kubernetes secret containing storage credentials">
              <input v-model="config.monitoringObservability.monitoring.objectStorage.secretName" type="text"
                class="mt-1 block w-full rounded-md border-gt-border shadow-sm focus:border-gt-accent focus:ring-gt-accent sm:text-sm border p-2"
                placeholder="monitoring-storage-credentials" />
            </FormField>
          </div>

          <!-- Cache -->
          <div v-if="config.monitoringObservability.monitoring.objectStorage.type !== 'none'" class="mt-4">
            <ToggleSwitch v-model="config.monitoringObservability.monitoring.objectStorage.cache.enabled"
              label="Enable Write Cache" description="Cache data locally before flushing to object storage" />
            <div v-if="config.monitoringObservability.monitoring.objectStorage.cache.enabled" class="mt-3 grid grid-cols-3 gap-4">
              <FormField label="Cache Capacity">
                <input v-model="config.monitoringObservability.monitoring.objectStorage.cache.cacheCapacity" type="text"
                  class="mt-1 block w-full rounded-md border-gt-border shadow-sm focus:border-gt-accent focus:ring-gt-accent sm:text-sm border p-2" placeholder="5Gi" />
              </FormField>
              <FormField label="Storage Class Name">
                <input v-model="config.monitoringObservability.monitoring.objectStorage.cache.storageClassName" type="text"
                  class="mt-1 block w-full rounded-md border-gt-border shadow-sm focus:border-gt-accent focus:ring-gt-accent sm:text-sm border p-2" />
              </FormField>
              <FormField label="Storage Size">
                <input v-model="config.monitoringObservability.monitoring.objectStorage.cache.storageSize" type="text"
                  class="mt-1 block w-full rounded-md border-gt-border shadow-sm focus:border-gt-accent focus:ring-gt-accent sm:text-sm border p-2" placeholder="10Gi" />
              </FormField>
            </div>
          </div>
        </div>

        <!-- Datanode Storage -->
        <div class="border-t border-gt-border pt-4">
          <h4 class="text-xs font-semibold text-gt-purple mb-3">Datanode Storage</h4>
          <ToggleSwitch v-model="config.monitoringObservability.monitoring.datanodeStorage.enabled"
            label="Configure Datanode Storage" description="Set custom storage class and size for the standalone datanode" />
          <div v-if="config.monitoringObservability.monitoring.datanodeStorage.enabled" class="mt-3 grid grid-cols-3 gap-4">
            <FormField label="Storage Class Name" description="Leave empty for default">
              <input v-model="config.monitoringObservability.monitoring.datanodeStorage.storageClassName" type="text"
                class="mt-1 block w-full rounded-md border-gt-border shadow-sm focus:border-gt-accent focus:ring-gt-accent sm:text-sm border p-2" placeholder="default" />
            </FormField>
            <FormField label="Storage Size">
              <input v-model="config.monitoringObservability.monitoring.datanodeStorage.storageSize" type="text"
                class="mt-1 block w-full rounded-md border-gt-border shadow-sm focus:border-gt-accent focus:ring-gt-accent sm:text-sm border p-2" placeholder="50Gi" />
            </FormField>
            <FormField label="Retain Policy">
              <select v-model="config.monitoringObservability.monitoring.datanodeStorage.storageRetainPolicy"
                class="mt-1 block w-full rounded-md border-gt-border shadow-sm focus:border-gt-accent focus:ring-gt-accent sm:text-sm border p-2">
                <option value="Retain">Retain</option>
                <option value="Delete">Delete</option>
              </select>
            </FormField>
          </div>
        </div>
      </div>
    </div>

    <!-- Grafana -->
    <div class="border border-gt-border rounded-lg p-4">
      <ToggleSwitch
        v-model="config.monitoringObservability.grafana.enabled"
        label="Grafana"
        description="Deploy Grafana subchart for dashboards and visualization"
      />
      <div v-if="config.monitoringObservability.grafana.enabled" class="mt-4 space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <FormField label="Admin User">
            <input
              v-model="config.monitoringObservability.grafana.adminUser"
              type="text"
              class="mt-1 block w-full rounded-md border-gt-border shadow-sm focus:border-gt-accent focus:ring-gt-accent sm:text-sm border p-2"
              placeholder="admin"
            />
          </FormField>
          <FormField label="Admin Password">
            <input
              v-model="config.monitoringObservability.grafana.adminPassword"
              type="password"
              class="mt-1 block w-full rounded-md border-gt-border shadow-sm focus:border-gt-accent focus:ring-gt-accent sm:text-sm border p-2"
            />
          </FormField>
        </div>
        <ToggleSwitch
          v-model="config.monitoringObservability.grafana.persistenceEnabled"
          label="Enable Persistence"
          description="Persist Grafana data across pod restarts"
        />
        <FormField v-if="config.monitoringObservability.grafana.persistenceEnabled" label="Persistence Size">
          <input
            v-model="config.monitoringObservability.grafana.persistenceSize"
            type="text"
            class="mt-1 block w-32 rounded-md border-gt-border shadow-sm focus:border-gt-accent focus:ring-gt-accent sm:text-sm border p-2"
            placeholder="1Gi"
          />
        </FormField>
      </div>
    </div>

    <!-- Jaeger -->
    <div class="border border-gt-border rounded-lg p-4">
      <ToggleSwitch
        v-model="config.monitoringObservability.jaeger.enabled"
        label="Jaeger"
        description="Deploy Jaeger all-in-one for distributed tracing"
      />
    </div>

    <!-- Tracing -->
    <div class="border border-gt-border rounded-lg p-4">
      <ToggleSwitch
        v-model="config.monitoringObservability.tracing.enabled"
        label="OpenTelemetry Tracing"
        description="Enable OTLP tracing export for all GreptimeDB components"
      />
      <div v-if="config.monitoringObservability.tracing.enabled" class="mt-4 grid grid-cols-2 gap-4">
        <FormField label="OTLP Endpoint" required>
          <input
            v-model="config.monitoringObservability.tracing.endpoint"
            type="text"
            class="mt-1 block w-full rounded-md border-gt-border shadow-sm focus:border-gt-accent focus:ring-gt-accent sm:text-sm border p-2"
            placeholder="http://jaeger:4317"
          />
        </FormField>
        <FormField label="Sample Ratio" description="0.0 to 1.0">
          <input
            v-model="config.monitoringObservability.tracing.sampleRatio"
            type="text"
            class="mt-1 block w-full rounded-md border-gt-border shadow-sm focus:border-gt-accent focus:ring-gt-accent sm:text-sm border p-2"
            placeholder="1.0"
          />
        </FormField>
      </div>
    </div>

    <!-- Slow Query -->
    <div class="border border-gt-border rounded-lg p-4">
      <ToggleSwitch
        v-model="config.monitoringObservability.slowQuery.enabled"
        label="Slow Query Logging"
        description="Record slow queries to a system table"
      />
      <div v-if="config.monitoringObservability.slowQuery.enabled" class="mt-4 grid grid-cols-2 gap-4">
        <FormField label="Threshold">
          <input
            v-model="config.monitoringObservability.slowQuery.threshold"
            type="text"
            class="mt-1 block w-full rounded-md border-gt-border shadow-sm focus:border-gt-accent focus:ring-gt-accent sm:text-sm border p-2"
            placeholder="30s"
          />
        </FormField>
        <FormField label="TTL">
          <input
            v-model="config.monitoringObservability.slowQuery.ttl"
            type="text"
            class="mt-1 block w-full rounded-md border-gt-border shadow-sm focus:border-gt-accent focus:ring-gt-accent sm:text-sm border p-2"
            placeholder="30d"
          />
        </FormField>
      </div>
    </div>

    <!-- Prometheus -->
    <div class="border border-gt-border rounded-lg p-4 space-y-2">
      <ToggleSwitch
        v-model="config.monitoringObservability.prometheus.monitorEnabled"
        label="Prometheus PodMonitor"
        description="Create a PodMonitor resource for Prometheus scraping"
      />
      <ToggleSwitch
        v-model="config.monitoringObservability.prometheus.ruleEnabled"
        label="PrometheusRule"
        description="Create PrometheusRule resources for alerting"
      />
    </div>
  </div>
</template>
