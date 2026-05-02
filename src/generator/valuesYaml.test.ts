import { describe, expect, it, vi } from 'vitest'
import { load as parseYaml } from 'js-yaml'
import type { AppConfig } from '../types/config'

async function createConfig(): Promise<AppConfig> {
  vi.resetModules()
  vi.stubGlobal('localStorage', {
    getItem: () => null,
    setItem: () => undefined,
    removeItem: () => undefined,
  })
  const { config, resetConfig } = await import('../store/config')
  resetConfig()
  return config
}

async function generate(config: AppConfig): Promise<Record<string, any>> {
  const { generateValuesYaml } = await import('./valuesYaml')
  return parseYaml(generateValuesYaml(config)) as Record<string, any>
}

describe('generateValuesYaml', () => {
  it('emits deployable child chart settings for remote compaction and dashboard', async () => {
    const config = await createConfig()
    config.customImageRegistry.registry = 'registry.example.com'
    config.customImageRegistry.username = 'user'
    config.customImageRegistry.password = 'pass'
    config.enterprise.remoteCompaction.enabled = true
    config.enterprise.remoteCompaction.scheduler.replicas = 2
    config.enterprise.remoteCompaction.compactor.replicas = 3
    config.enterprise.dashboard.enabled = true
    config.enterprise.dashboard.replicas = 4
    config.clusterName = 'prod-greptime'
    config.clusterNamespace = 'analytics'
    config.objectStorage.type = 's3'
    config.objectStorage.s3.bucket = 'data-bucket'
    config.objectStorage.s3.region = 'us-west-2'
    config.objectStorage.s3.root = 'prod-greptime'
    config.objectStorage.credentials.accessKeyId = 'access-key'
    config.objectStorage.credentials.secretAccessKey = 'secret-key'

    const values = await generate(config)

    expect(values['greptimedb-remote-compaction'].scheduler.image).toMatchObject({
      registry: 'docker.io',
      repository: 'greptime/greptimedb-remote-compaction-scheduler',
      tag: 'latest',
    })
    expect(values['greptimedb-remote-compaction'].scheduler.replicas).toBe(2)
    expect(values['greptimedb-remote-compaction'].compactor.image).toMatchObject({
      registry: 'docker.io',
      repository: 'greptime/greptimedb-remote-compaction-compactor',
      tag: 'latest',
    })
    expect(values['greptimedb-remote-compaction'].compactor.replicas).toBe(3)
    expect(values['greptimedb-remote-compaction'].compactor.objectStorage.s3).toMatchObject({
      bucket: 'data-bucket',
      region: 'us-west-2',
      root: 'prod-greptime',
    })
    expect(values['greptimedb-remote-compaction'].compactor.objectStorage.credentials.accessKeyId).toBe('access-key')
    expect(values['greptimedb-remote-compaction'].compactor.objectStorage.credentials.secretAccessKey).toBe('secret-key')
    expect(values['greptimedb-enterprise-dashboard'].image).toMatchObject({
      repository: 'docker.io/greptime/greptimedb-enterprise-dashboard',
      tag: 'latest',
    })
    expect(values['greptimedb-enterprise-dashboard'].replicaCount).toBe(4)
    expect(values['greptimedb-enterprise-dashboard'].config).toContain('name: prod-greptime')
    expect(values['greptimedb-enterprise-dashboard'].config).toContain('namespace: analytics')
    expect(values['greptimedb-enterprise-dashboard'].config).toContain('http://prod-greptime-frontend.analytics.svc.cluster.local:4000')
  })

  it('emits generated meta backend secret names when credentials are inline', async () => {
    const config = await createConfig()
    config.meta.backendStorage.type = 'mysql'
    config.meta.backendStorage.mysql.host = 'mysql.default.svc'
    config.meta.backendStorage.mysql.database = 'metasrv'
    config.meta.backendStorage.mysql.table = 'greptime_metakv'
    config.meta.backendStorage.mysql.credentials.username = 'root'
    config.meta.backendStorage.mysql.credentials.password = 'secret'

    const values = await generate(config)

    expect(values.meta.backendStorage.mysql.credentials.secretName).toBe('meta-mysql-credentials')
  })

  it('does not reuse parent object storage existing secrets for remote compaction', async () => {
    const config = await createConfig()
    config.enterprise.remoteCompaction.enabled = true
    config.objectStorage.type = 's3'
    config.objectStorage.s3.bucket = 'data-bucket'
    config.objectStorage.s3.region = 'us-west-2'
    config.objectStorage.s3.root = 'greptimedb'
    config.objectStorage.credentials.existingSecretName = 'storage-secret'

    const values = await generate(config)

    expect(values['greptimedb-remote-compaction'].compactor.objectStorage.credentials).toBeUndefined()
  })

  it('uses provider-specific object storage credential keys', async () => {
    const config = await createConfig()
    config.objectStorage.type = 'azblob'
    config.objectStorage.azblob.container = 'greptime'
    config.objectStorage.azblob.root = 'prod-greptime'
    config.objectStorage.credentials.accessKeyId = 'account-name'
    config.objectStorage.credentials.secretAccessKey = 'account-key'

    const values = await generate(config)

    expect(values.objectStorage.credentials).toMatchObject({
      accountName: 'account-name',
      accountKey: 'account-key',
    })
    expect(values.objectStorage.credentials.accessKeyId).toBeUndefined()
    expect(values.objectStorage.credentials.secretAccessKey).toBeUndefined()
  })

  it('emits monitoring standalone resources', async () => {
    const config = await createConfig()
    config.monitoringObservability.monitoring.enabled = true
    config.monitoringObservability.monitoring.resources.cpu = '750m'
    config.monitoringObservability.monitoring.resources.memory = '768Mi'

    const values = await generate(config)

    expect(values.monitoring.standalone.base.main.resources.requests).toEqual({
      cpu: '750m',
      memory: '768Mi',
    })
    expect(values.monitoring.standalone.base.main.resources.limits).toEqual({
      cpu: '750m',
      memory: '768Mi',
    })
  })

  it('emits required cache file-storage fields', async () => {
    const config = await createConfig()
    config.objectStorage.type = 's3'
    config.objectStorage.s3.bucket = 'bucket'
    config.objectStorage.s3.region = 'us-west-2'
    config.objectStorage.s3.root = 'greptimedb'
    config.objectStorage.credentials.existingSecretName = 'storage-credentials'
    config.objectStorage.cache.enabled = true

    const values = await generate(config)

    expect(values.objectStorage.cache.fs).toMatchObject({
      name: 'cache',
      mountPath: '/cache',
      storageSize: '10Gi',
    })
  })

  it('escapes quoted scalar values safely', async () => {
    const config = await createConfig()
    config.customImageRegistry.registry = 'registry.example.com'
    config.customImageRegistry.username = 'user'
    config.customImageRegistry.password = 'p"a\\ss'

    const values = await generate(config)

    expect(values.customImageRegistry.password).toBe('p"a\\ss')
  })
})
