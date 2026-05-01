<script setup lang="ts">
import { config } from '../../store/config'
import FormField from '../ui/FormField.vue'
import ToggleSwitch from '../ui/ToggleSwitch.vue'
</script>

<template>
  <div class="space-y-6">
    <FormField label="Cluster Name" description="Used for naming resources in the cluster">
      <input
        v-model="config.clusterName"
        type="text"
        class="mt-1 block w-full rounded-md border-gt-border shadow-sm focus:border-gt-accent focus:ring-gt-accent sm:text-sm border p-2"
        placeholder="greptimedb"
      />
    </FormField>

    <div class="border-t border-gt-border pt-6">
      <h3 class="text-sm font-semibold text-gt-purple mb-4">GreptimeDB Image</h3>
      <div class="grid grid-cols-3 gap-4">
        <FormField label="Registry">
          <input
            v-model="config.image.registry"
            type="text"
            class="mt-1 block w-full rounded-md border-gt-border shadow-sm focus:border-gt-accent focus:ring-gt-accent sm:text-sm border p-2"
            placeholder="docker.io"
          />
        </FormField>
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
      <ToggleSwitch
        v-model="config.customImageRegistry.enabled"
        label="Use Custom Image Registry"
        description="Pull images from a private registry with authentication"
      />
      <div v-if="config.customImageRegistry.enabled" class="mt-4 grid grid-cols-3 gap-4">
        <FormField label="Registry URL">
          <input
            v-model="config.customImageRegistry.registry"
            type="text"
            class="mt-1 block w-full rounded-md border-gt-border shadow-sm focus:border-gt-accent focus:ring-gt-accent sm:text-sm border p-2"
            placeholder="registry.example.com"
          />
        </FormField>
        <FormField label="Username">
          <input
            v-model="config.customImageRegistry.username"
            type="text"
            class="mt-1 block w-full rounded-md border-gt-border shadow-sm focus:border-gt-accent focus:ring-gt-accent sm:text-sm border p-2"
          />
        </FormField>
        <FormField label="Password">
          <input
            v-model="config.customImageRegistry.password"
            type="password"
            class="mt-1 block w-full rounded-md border-gt-border shadow-sm focus:border-gt-accent focus:ring-gt-accent sm:text-sm border p-2"
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
