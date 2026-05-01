<script setup lang="ts">
import { config } from '../../store/config'
import FormField from '../ui/FormField.vue'
import ToggleSwitch from '../ui/ToggleSwitch.vue'
import type { AuthUser } from '../../types/config'

function addUser() {
  config.enterprise.auth.users.push({
    username: '',
    password: '',
    permission: 'readwrite',
  })
}

function removeUser(index: number) {
  config.enterprise.auth.users.splice(index, 1)
}
</script>

<template>
  <div class="space-y-6">
    <!-- License -->
    <div class="border border-gray-200 rounded-lg p-4">
      <ToggleSwitch
        v-model="config.enterprise.license.enabled"
        label="Enterprise License"
        description="Enable the enterprise license for premium features"
      />
      <div v-if="config.enterprise.license.enabled" class="mt-4">
        <FormField label="License Data" description="Paste your license file contents or use --set-file at install time">
          <textarea
            v-model="config.enterprise.license.data"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2 font-mono text-xs"
            rows="4"
            placeholder="Paste license content here (optional)"
          />
        </FormField>
      </div>
    </div>

    <!-- Authentication -->
    <div class="border border-gray-200 rounded-lg p-4">
      <ToggleSwitch
        v-model="config.enterprise.auth.enabled"
        label="Authentication"
        description="Enable user authentication for GreptimeDB"
      />
      <div v-if="config.enterprise.auth.enabled" class="mt-4 space-y-4">
        <ToggleSwitch
          v-model="config.enterprise.auth.useBuiltIn"
          label="Use Built-in Auth Provider"
          description="Use the built-in authentication provider (default: static file)"
        />
        <div>
          <div class="flex items-center justify-between mb-3">
            <h4 class="text-xs font-semibold text-gray-700">Users</h4>
            <button
              class="text-sm text-blue-600 hover:text-blue-800"
              @click="addUser"
            >
              + Add user
            </button>
          </div>
          <div v-for="(user, index) in config.enterprise.auth.users" :key="index" class="flex items-end gap-3 mb-3 p-3 bg-gray-50 rounded">
            <FormField label="Username">
              <input
                v-model="user.username"
                type="text"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
              />
            </FormField>
            <FormField label="Password">
              <input
                v-model="user.password"
                type="password"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
              />
            </FormField>
            <FormField label="Permission">
              <select
                v-model="user.permission"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
              >
                <option value="readwrite">Read/Write</option>
                <option value="readonly">Read Only</option>
                <option value="writeonly">Write Only</option>
              </select>
            </FormField>
            <button
              class="text-red-500 hover:text-red-700 text-sm pb-1"
              @click="removeUser(index)"
            >
              Remove
            </button>
          </div>
          <p v-if="config.enterprise.auth.users.length === 0" class="text-xs text-gray-400">No users configured</p>
        </div>
      </div>
    </div>

    <!-- Remote Compaction -->
    <div class="border border-gray-200 rounded-lg p-4">
      <ToggleSwitch
        v-model="config.enterprise.remoteCompaction.enabled"
        label="Remote Compaction"
        description="Enterprise feature: offload compaction to dedicated scheduler and compactor pods"
      />
      <div v-if="config.enterprise.remoteCompaction.enabled" class="mt-4 space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div class="p-3 bg-gray-50 rounded space-y-3">
            <h4 class="text-xs font-semibold text-gray-700">Scheduler</h4>
            <FormField label="Replicas">
              <input
                v-model.number="config.enterprise.remoteCompaction.scheduler.replicas"
                type="number"
                min="1"
                class="mt-1 block w-24 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
              />
            </FormField>
          </div>
          <div class="p-3 bg-gray-50 rounded space-y-3">
            <h4 class="text-xs font-semibold text-gray-700">Compactor</h4>
            <FormField label="Replicas">
              <input
                v-model.number="config.enterprise.remoteCompaction.compactor.replicas"
                type="number"
                min="1"
                class="mt-1 block w-24 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
              />
            </FormField>
          </div>
        </div>
      </div>
    </div>

    <!-- Enterprise Dashboard -->
    <div class="border border-gray-200 rounded-lg p-4">
      <ToggleSwitch
        v-model="config.enterprise.dashboard.enabled"
        label="Enterprise Dashboard"
        description="Web dashboard for managing GreptimeDB clusters with region management, metrics, and logs"
      />
      <div v-if="config.enterprise.dashboard.enabled" class="mt-4">
        <FormField label="Replicas">
          <input
            v-model.number="config.enterprise.dashboard.replicas"
            type="number"
            min="1"
            class="mt-1 block w-24 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
          />
        </FormField>
      </div>
    </div>

    <!-- Region Failover -->
    <div class="border border-gray-200 rounded-lg p-4">
      <ToggleSwitch
        v-model="config.enterprise.regionFailover"
        label="Region Failover"
        description="Enable automatic region failover on the Meta component"
      />
    </div>
  </div>
</template>
