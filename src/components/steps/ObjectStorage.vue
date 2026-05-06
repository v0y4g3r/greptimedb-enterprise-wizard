<script setup lang="ts">
import { computed, inject, ref, watch } from 'vue'
import { config } from '../../store/config'
import { isObjectStorageValid } from '../../validation/configValidation'
import FormField from '../ui/FormField.vue'
import RadioGroup from '../ui/RadioGroup.vue'
import ToggleSwitch from '../ui/ToggleSwitch.vue'

const useExistingSecret = ref(!!config.objectStorage.credentials.existingSecretName)
watch(useExistingSecret, (val) => {
  if (val) {
    config.objectStorage.credentials.accessKeyId = ''
    config.objectStorage.credentials.secretAccessKey = ''
  } else {
    config.objectStorage.credentials.existingSecretName = ''
  }
})

const stepValid = computed(() => isObjectStorageValid(config.objectStorage))
const setStepValid = inject<(step: number, valid: boolean) => void>('setStepValid')!
watch(stepValid, (valid) => setStepValid(4, valid), { immediate: true })
</script>

<template>
  <div class="space-y-6">
    <div v-if="!stepValid" class="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
      Complete the selected object storage provider and credentials before proceeding.
    </div>

    <RadioGroup
      v-model="config.objectStorage.type"
      label="Object Storage Backend"
      description="Choose where GreptimeDB stores its data files"
      :options="[
        { value: 'none', label: 'Local Filesystem', description: 'Use local storage (for development/testing only)' },
        { value: 's3', label: 'AWS S3 / S3-compatible', description: 'Amazon S3, MinIO, or other S3-compatible storage' },
        { value: 'gcs', label: 'Google Cloud Storage', description: 'GCS bucket for data storage' },
        { value: 'azblob', label: 'Azure Blob Storage', description: 'Azure Blob container for data storage' },
        { value: 'oss', label: 'Alibaba Cloud OSS', description: 'Alibaba Cloud Object Storage Service' },
      ]"
    />

    <!-- S3 config -->
    <div v-if="config.objectStorage.type === 's3'" class="border border-gt-border rounded-lg p-4 space-y-4">
      <div class="grid grid-cols-2 gap-4">
        <FormField label="Bucket" required>
          <input
            v-model="config.objectStorage.s3.bucket"
            type="text"
            class="mt-1 block w-full rounded-md border-gt-border shadow-sm focus:border-gt-accent focus:ring-gt-accent sm:text-sm border p-2"
            placeholder="my-greptimedb-bucket"
          />
        </FormField>
        <FormField label="Region" required>
          <input
            v-model="config.objectStorage.s3.region"
            type="text"
            class="mt-1 block w-full rounded-md border-gt-border shadow-sm focus:border-gt-accent focus:ring-gt-accent sm:text-sm border p-2"
            placeholder="us-west-2"
          />
        </FormField>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <FormField label="Root Path" required description="Prefix within the bucket">
          <input
            v-model="config.objectStorage.s3.root"
            type="text"
            class="mt-1 block w-full rounded-md border-gt-border shadow-sm focus:border-gt-accent focus:ring-gt-accent sm:text-sm border p-2"
          />
        </FormField>
        <FormField label="Endpoint" description="For S3-compatible services (e.g., MinIO)">
          <input
            v-model="config.objectStorage.s3.endpoint"
            type="text"
            class="mt-1 block w-full rounded-md border-gt-border shadow-sm focus:border-gt-accent focus:ring-gt-accent sm:text-sm border p-2"
            placeholder="https://minio.example.com"
          />
        </FormField>
      </div>
      <ToggleSwitch
        v-model="config.objectStorage.s3.enableVirtualHostStyle"
        label="Enable Virtual Host Style"
        description="Use virtual host style URLs (e.g. bucket.s3.amazonaws.com) instead of path style"
      />
    </div>

    <!-- GCS config -->
    <div v-if="config.objectStorage.type === 'gcs'" class="border border-gt-border rounded-lg p-4 space-y-4">
      <div class="grid grid-cols-2 gap-4">
        <FormField label="Bucket" required>
          <input
            v-model="config.objectStorage.gcs.bucket"
            type="text"
            class="mt-1 block w-full rounded-md border-gt-border shadow-sm focus:border-gt-accent focus:ring-gt-accent sm:text-sm border p-2"
            placeholder="my-greptimedb-bucket"
          />
        </FormField>
        <FormField label="Scope">
          <input
            v-model="config.objectStorage.gcs.scope"
            type="text"
            class="mt-1 block w-full rounded-md border-gt-border shadow-sm focus:border-gt-accent focus:ring-gt-accent sm:text-sm border p-2"
          />
        </FormField>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <FormField label="Root Path" required>
          <input
            v-model="config.objectStorage.gcs.root"
            type="text"
            class="mt-1 block w-full rounded-md border-gt-border shadow-sm focus:border-gt-accent focus:ring-gt-accent sm:text-sm border p-2"
          />
        </FormField>
        <FormField label="Endpoint">
          <input
            v-model="config.objectStorage.gcs.endpoint"
            type="text"
            class="mt-1 block w-full rounded-md border-gt-border shadow-sm focus:border-gt-accent focus:ring-gt-accent sm:text-sm border p-2"
          />
        </FormField>
      </div>
    </div>

    <!-- Azure Blob config -->
    <div v-if="config.objectStorage.type === 'azblob'" class="border border-gt-border rounded-lg p-4 space-y-4">
      <div class="grid grid-cols-2 gap-4">
        <FormField label="Container" required>
          <input
            v-model="config.objectStorage.azblob.container"
            type="text"
            class="mt-1 block w-full rounded-md border-gt-border shadow-sm focus:border-gt-accent focus:ring-gt-accent sm:text-sm border p-2"
            placeholder="greptimedb"
          />
        </FormField>
        <FormField label="Endpoint">
          <input
            v-model="config.objectStorage.azblob.endpoint"
            type="text"
            class="mt-1 block w-full rounded-md border-gt-border shadow-sm focus:border-gt-accent focus:ring-gt-accent sm:text-sm border p-2"
          />
        </FormField>
      </div>
      <FormField label="Root Path" required>
        <input
          v-model="config.objectStorage.azblob.root"
          type="text"
          class="mt-1 block w-full rounded-md border-gt-border shadow-sm focus:border-gt-accent focus:ring-gt-accent sm:text-sm border p-2"
        />
      </FormField>
    </div>

    <!-- OSS config -->
    <div v-if="config.objectStorage.type === 'oss'" class="border border-gt-border rounded-lg p-4 space-y-4">
      <div class="grid grid-cols-2 gap-4">
        <FormField label="Bucket" required>
          <input
            v-model="config.objectStorage.oss.bucket"
            type="text"
            class="mt-1 block w-full rounded-md border-gt-border shadow-sm focus:border-gt-accent focus:ring-gt-accent sm:text-sm border p-2"
            placeholder="my-greptimedb-bucket"
          />
        </FormField>
        <FormField label="Region" required>
          <input
            v-model="config.objectStorage.oss.region"
            type="text"
            class="mt-1 block w-full rounded-md border-gt-border shadow-sm focus:border-gt-accent focus:ring-gt-accent sm:text-sm border p-2"
          />
        </FormField>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <FormField label="Root Path" required>
          <input
            v-model="config.objectStorage.oss.root"
            type="text"
            class="mt-1 block w-full rounded-md border-gt-border shadow-sm focus:border-gt-accent focus:ring-gt-accent sm:text-sm border p-2"
          />
        </FormField>
        <FormField label="Endpoint">
          <input
            v-model="config.objectStorage.oss.endpoint"
            type="text"
            class="mt-1 block w-full rounded-md border-gt-border shadow-sm focus:border-gt-accent focus:ring-gt-accent sm:text-sm border p-2"
          />
        </FormField>
      </div>
    </div>

    <!-- Credentials (for all cloud providers) -->
    <div v-if="config.objectStorage.type !== 'none'" class="border border-gt-border rounded-lg p-4 space-y-4">
      <h3 class="text-sm font-semibold text-gt-purple">Credentials</h3>
      <ToggleSwitch
        v-model="useExistingSecret"
        label="Use existing Kubernetes secret"
        description="Toggle on to reference a pre-existing secret, or off to input credentials directly"
      />
      <FormField v-if="useExistingSecret" label="Secret Name" description="Name of the Kubernetes secret containing storage credentials">
        <input
          v-model="config.objectStorage.credentials.existingSecretName"
          type="text"
          class="mt-1 block w-full rounded-md border-gt-border shadow-sm focus:border-gt-accent focus:ring-gt-accent sm:text-sm border p-2"
          placeholder="my-storage-credentials"
        />
      </FormField>
      <template v-else>
        <div v-if="config.objectStorage.type === 'gcs'">
          <FormField label="Service Account Key" required description="JSON-formatted base64 service account key">
            <input
              v-model="config.objectStorage.credentials.secretAccessKey"
              type="password"
              class="mt-1 block w-full rounded-md border-gt-border shadow-sm focus:border-gt-accent focus:ring-gt-accent sm:text-sm border p-2"
            />
          </FormField>
        </div>
        <div v-else class="grid grid-cols-2 gap-4">
          <FormField :label="config.objectStorage.type === 'azblob' ? 'Account Name' : 'Access Key ID'" required>
            <input
              v-model="config.objectStorage.credentials.accessKeyId"
              type="text"
              class="mt-1 block w-full rounded-md border-gt-border shadow-sm focus:border-gt-accent focus:ring-gt-accent sm:text-sm border p-2"
            />
          </FormField>
          <FormField :label="config.objectStorage.type === 'azblob' ? 'Account Key' : config.objectStorage.type === 'oss' ? 'Access Key Secret' : 'Secret Access Key'" required>
            <input
              v-model="config.objectStorage.credentials.secretAccessKey"
              type="password"
              class="mt-1 block w-full rounded-md border-gt-border shadow-sm focus:border-gt-accent focus:ring-gt-accent sm:text-sm border p-2"
            />
          </FormField>
        </div>
      </template>
    </div>

    <!-- Cache -->
    <div v-if="config.objectStorage.type !== 'none'" class="border border-gt-border rounded-lg p-4">
      <ToggleSwitch
        v-model="config.objectStorage.cache.enabled"
        label="Enable Write Cache"
        description="Cache data locally before flushing to object storage"
      />
      <div v-if="config.objectStorage.cache.enabled" class="mt-4 grid grid-cols-3 gap-4">
        <FormField label="Cache Capacity">
          <input
            v-model="config.objectStorage.cache.cacheCapacity"
            type="text"
            class="mt-1 block w-full rounded-md border-gt-border shadow-sm focus:border-gt-accent focus:ring-gt-accent sm:text-sm border p-2"
            placeholder="5Gi"
          />
        </FormField>
        <FormField label="Storage Class Name">
          <input
            v-model="config.objectStorage.cache.storageClassName"
            type="text"
            class="mt-1 block w-full rounded-md border-gt-border shadow-sm focus:border-gt-accent focus:ring-gt-accent sm:text-sm border p-2"
          />
        </FormField>
        <FormField label="Storage Size">
          <input
            v-model="config.objectStorage.cache.storageSize"
            type="text"
            class="mt-1 block w-full rounded-md border-gt-border shadow-sm focus:border-gt-accent focus:ring-gt-accent sm:text-sm border p-2"
            placeholder="10Gi"
          />
        </FormField>
      </div>
    </div>
  </div>
</template>
