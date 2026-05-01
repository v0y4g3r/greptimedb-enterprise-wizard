<script setup lang="ts">
import { config } from '../../store/config'
import FormField from '../ui/FormField.vue'
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
      <div v-if="config.monitoringObservability.monitoring.enabled" class="mt-4">
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
