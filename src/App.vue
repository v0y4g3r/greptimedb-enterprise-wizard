<script setup lang="ts">
import WizardShell from './components/WizardShell.vue'
import ClusterBasics from './components/steps/ClusterBasics.vue'
import ComponentsStep from './components/steps/Components.vue'
import MetaBackend from './components/steps/MetaBackend.vue'
import ObjectStorage from './components/steps/ObjectStorage.vue'
import WalConfig from './components/steps/WalConfig.vue'
import EnterpriseFeatures from './components/steps/EnterpriseFeatures.vue'
import Monitoring from './components/steps/Monitoring.vue'
import ReviewGenerate from './components/steps/ReviewGenerate.vue'
</script>

<template>
  <WizardShell v-slot="{ currentStep }">
    <ClusterBasics v-if="currentStep === 1" />
    <ComponentsStep v-if="currentStep === 2" />
    <MetaBackend v-if="currentStep === 3" />
    <ObjectStorage v-if="currentStep === 4" />
    <WalConfig v-if="currentStep === 5" />
    <EnterpriseFeatures v-if="currentStep === 6" />
    <Monitoring v-if="currentStep === 7" />
    <ReviewGenerate v-if="currentStep === 8" />
  </WizardShell>
</template>
