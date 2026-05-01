<script setup lang="ts">
import { config } from '../../store/config'
import FormField from '../ui/FormField.vue'
import RadioGroup from '../ui/RadioGroup.vue'
import ToggleSwitch from '../ui/ToggleSwitch.vue'
</script>

<template>
  <div class="space-y-6">
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
    <div v-if="config.objectStorage.type === 's3'" class="border border-gray-200 rounded-lg p-4 space-y-4">
      <div class="grid grid-cols-2 gap-4">
        <FormField label="Bucket" required>
          <input
            v-model="config.objectStorage.s3.bucket"
            type="text"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
            placeholder="my-greptimedb-bucket"
          />
        </FormField>
        <FormField label="Region">
          <input
            v-model="config.objectStorage.s3.region"
            type="text"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
            placeholder="us-west-2"
          />
        </FormField>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <FormField label="Root Path" description="Optional prefix within the bucket">
          <input
            v-model="config.objectStorage.s3.root"
            type="text"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
          />
        </FormField>
        <FormField label="Endpoint" description="For S3-compatible services (e.g., MinIO)">
          <input
            v-model="config.objectStorage.s3.endpoint"
            type="text"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
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
    <div v-if="config.objectStorage.type === 'gcs'" class="border border-gray-200 rounded-lg p-4 space-y-4">
      <div class="grid grid-cols-2 gap-4">
        <FormField label="Bucket" required>
          <input
            v-model="config.objectStorage.gcs.bucket"
            type="text"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
            placeholder="my-greptimedb-bucket"
          />
        </FormField>
        <FormField label="Scope">
          <input
            v-model="config.objectStorage.gcs.scope"
            type="text"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
          />
        </FormField>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <FormField label="Root Path">
          <input
            v-model="config.objectStorage.gcs.root"
            type="text"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
          />
        </FormField>
        <FormField label="Endpoint">
          <input
            v-model="config.objectStorage.gcs.endpoint"
            type="text"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
          />
        </FormField>
      </div>
    </div>

    <!-- Azure Blob config -->
    <div v-if="config.objectStorage.type === 'azblob'" class="border border-gray-200 rounded-lg p-4 space-y-4">
      <div class="grid grid-cols-2 gap-4">
        <FormField label="Container" required>
          <input
            v-model="config.objectStorage.azblob.container"
            type="text"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
            placeholder="greptimedb"
          />
        </FormField>
        <FormField label="Endpoint">
          <input
            v-model="config.objectStorage.azblob.endpoint"
            type="text"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
          />
        </FormField>
      </div>
      <FormField label="Root Path">
        <input
          v-model="config.objectStorage.azblob.root"
          type="text"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
        />
      </FormField>
    </div>

    <!-- OSS config -->
    <div v-if="config.objectStorage.type === 'oss'" class="border border-gray-200 rounded-lg p-4 space-y-4">
      <div class="grid grid-cols-2 gap-4">
        <FormField label="Bucket" required>
          <input
            v-model="config.objectStorage.oss.bucket"
            type="text"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
            placeholder="my-greptimedb-bucket"
          />
        </FormField>
        <FormField label="Region">
          <input
            v-model="config.objectStorage.oss.region"
            type="text"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
          />
        </FormField>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <FormField label="Root Path">
          <input
            v-model="config.objectStorage.oss.root"
            type="text"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
          />
        </FormField>
        <FormField label="Endpoint">
          <input
            v-model="config.objectStorage.oss.endpoint"
            type="text"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
          />
        </FormField>
      </div>
    </div>

    <!-- Credentials (for all cloud providers) -->
    <div v-if="config.objectStorage.type !== 'none'" class="border border-gray-200 rounded-lg p-4 space-y-4">
      <h3 class="text-sm font-semibold text-gray-800">Credentials</h3>
      <FormField label="Existing Secret Name" description="Use a pre-existing Kubernetes secret for credentials">
        <input
          v-model="config.objectStorage.credentials.existingSecretName"
          type="text"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
        />
      </FormField>
      <div v-if="!config.objectStorage.credentials.existingSecretName" class="grid grid-cols-2 gap-4">
        <FormField :label="config.objectStorage.type === 'azblob' ? 'Account Name' : 'Access Key ID'">
          <input
            v-model="config.objectStorage.credentials.accessKeyId"
            type="text"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
          />
        </FormField>
        <FormField :label="config.objectStorage.type === 'azblob' ? 'Account Key' : 'Secret Access Key'">
          <input
            v-model="config.objectStorage.credentials.secretAccessKey"
            type="password"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
          />
        </FormField>
      </div>
    </div>

    <!-- Cache -->
    <div v-if="config.objectStorage.type !== 'none'" class="border border-gray-200 rounded-lg p-4">
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
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
            placeholder="5Gi"
          />
        </FormField>
        <FormField label="Storage Class Name">
          <input
            v-model="config.objectStorage.cache.storageClassName"
            type="text"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
          />
        </FormField>
        <FormField label="Storage Size">
          <input
            v-model="config.objectStorage.cache.storageSize"
            type="text"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
            placeholder="10Gi"
          />
        </FormField>
      </div>
    </div>
  </div>
</template>
