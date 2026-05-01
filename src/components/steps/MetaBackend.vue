<script setup lang="ts">
import { config } from '../../store/config'
import FormField from '../ui/FormField.vue'
import RadioGroup from '../ui/RadioGroup.vue'

function addEndpoint() {
  config.meta.backendStorage.etcd.endpoints.push('')
}

function removeEndpoint(index: number) {
  config.meta.backendStorage.etcd.endpoints.splice(index, 1)
}
</script>

<template>
  <div class="space-y-6">
    <RadioGroup
      v-model="config.meta.backendStorage.type"
      label="Metadata Backend Storage"
      description="Choose where Metasrv stores its metadata"
      :options="[
        { value: 'etcd', label: 'etcd (Recommended)', description: 'Default distributed key-value store for metadata' },
        { value: 'mysql', label: 'MySQL', description: 'Use an existing MySQL instance as metadata store' },
        { value: 'postgresql', label: 'PostgreSQL', description: 'Use an existing PostgreSQL instance as metadata store' },
      ]"
    />

    <!-- etcd config -->
    <div v-if="config.meta.backendStorage.type === 'etcd'" class="border border-gray-200 rounded-lg p-4 space-y-4">
      <FormField label="etcd Endpoints" description="List of etcd server endpoints" required>
        <div v-for="(ep, index) in config.meta.backendStorage.etcd.endpoints" :key="index" class="flex items-center gap-2 mt-2">
          <input
            v-model="config.meta.backendStorage.etcd.endpoints[index]"
            type="text"
            class="block flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
            placeholder="etcd.etcd-cluster.svc.cluster.local:2379"
          />
          <button
            v-if="config.meta.backendStorage.etcd.endpoints.length > 1"
            class="text-red-500 hover:text-red-700 text-sm px-2"
            @click="removeEndpoint(index)"
          >
            Remove
          </button>
        </div>
        <button
          class="mt-2 text-sm text-blue-600 hover:text-blue-800"
          @click="addEndpoint"
        >
          + Add endpoint
        </button>
      </FormField>

      <FormField label="Store Key Prefix" description="Optional prefix for etcd keys">
        <input
          v-model="config.meta.backendStorage.etcd.storeKeyPrefix"
          type="text"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
          placeholder=""
        />
      </FormField>
    </div>

    <!-- MySQL config -->
    <div v-if="config.meta.backendStorage.type === 'mysql'" class="border border-gray-200 rounded-lg p-4 space-y-4">
      <div class="grid grid-cols-2 gap-4">
        <FormField label="Host" required>
          <input
            v-model="config.meta.backendStorage.mysql.host"
            type="text"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
            placeholder="mysql.example.com"
          />
        </FormField>
        <FormField label="Port">
          <input
            v-model.number="config.meta.backendStorage.mysql.port"
            type="number"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
            placeholder="3306"
          />
        </FormField>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <FormField label="Database" required>
          <input
            v-model="config.meta.backendStorage.mysql.database"
            type="text"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
            placeholder="greptimedb"
          />
        </FormField>
        <FormField label="Table">
          <input
            v-model="config.meta.backendStorage.mysql.table"
            type="text"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
          />
        </FormField>
      </div>
      <div class="border-t border-gray-100 pt-4">
        <h4 class="text-xs font-semibold text-gray-700 mb-3">Credentials</h4>
        <FormField label="Existing Secret Name" description="Use a pre-existing Kubernetes secret instead of username/password">
          <input
            v-model="config.meta.backendStorage.mysql.credentials.existingSecretName"
            type="text"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
            placeholder=""
          />
        </FormField>
        <div v-if="!config.meta.backendStorage.mysql.credentials.existingSecretName" class="grid grid-cols-2 gap-4 mt-4">
          <FormField label="Username">
            <input
              v-model="config.meta.backendStorage.mysql.credentials.username"
              type="text"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
            />
          </FormField>
          <FormField label="Password">
            <input
              v-model="config.meta.backendStorage.mysql.credentials.password"
              type="password"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
            />
          </FormField>
        </div>
      </div>
    </div>

    <!-- PostgreSQL config -->
    <div v-if="config.meta.backendStorage.type === 'postgresql'" class="border border-gray-200 rounded-lg p-4 space-y-4">
      <div class="grid grid-cols-2 gap-4">
        <FormField label="Host" required>
          <input
            v-model="config.meta.backendStorage.postgresql.host"
            type="text"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
            placeholder="postgres.example.com"
          />
        </FormField>
        <FormField label="Port">
          <input
            v-model.number="config.meta.backendStorage.postgresql.port"
            type="number"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
            placeholder="5432"
          />
        </FormField>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <FormField label="Database" required>
          <input
            v-model="config.meta.backendStorage.postgresql.database"
            type="text"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
            placeholder="greptimedb"
          />
        </FormField>
        <FormField label="Table">
          <input
            v-model="config.meta.backendStorage.postgresql.table"
            type="text"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
          />
        </FormField>
      </div>
      <FormField label="Election Lock ID" description="Optional lock ID for leader election">
        <input
          v-model="config.meta.backendStorage.postgresql.electionLockID"
          type="text"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
        />
      </FormField>
      <div class="border-t border-gray-100 pt-4">
        <h4 class="text-xs font-semibold text-gray-700 mb-3">Credentials</h4>
        <FormField label="Existing Secret Name" description="Use a pre-existing Kubernetes secret instead of username/password">
          <input
            v-model="config.meta.backendStorage.postgresql.credentials.existingSecretName"
            type="text"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
            placeholder=""
          />
        </FormField>
        <div v-if="!config.meta.backendStorage.postgresql.credentials.existingSecretName" class="grid grid-cols-2 gap-4 mt-4">
          <FormField label="Username">
            <input
              v-model="config.meta.backendStorage.postgresql.credentials.username"
              type="text"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
            />
          </FormField>
          <FormField label="Password">
            <input
              v-model="config.meta.backendStorage.postgresql.credentials.password"
              type="password"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
            />
          </FormField>
        </div>
      </div>
    </div>
  </div>
</template>
