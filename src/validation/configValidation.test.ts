import { describe, expect, it } from 'vitest'
import type { EnterpriseFeatures, MetaBackendStorage, MonitoringObservability, ObjectStorageConfig } from '../types/config'
import { isEnterpriseValid, isMetaBackendValid, isMonitoringValid, isObjectStorageValid } from './configValidation'

describe('step validation', () => {
  it('requires selected MySQL metadata backend fields', () => {
    const backend = {
      type: 'mysql',
      etcd: { endpoints: ['etcd:2379'], storeKeyPrefix: '' },
      mysql: { host: '', port: 3306, database: '', table: '', credentials: { username: '', password: '', existingSecretName: '' } },
      postgresql: { host: '', port: 5432, database: '', table: '', electionLockID: '', credentials: { username: '', password: '', existingSecretName: '' } },
    } satisfies MetaBackendStorage

    expect(isMetaBackendValid(backend)).toBe(false)

    backend.mysql.host = 'mysql.default.svc'
    backend.mysql.database = 'metasrv'
    backend.mysql.credentials.username = 'root'
    backend.mysql.credentials.password = 'secret'

    expect(isMetaBackendValid(backend)).toBe(true)
  })

  it('requires selected object storage provider fields and credentials', () => {
    const storage = {
      type: 's3',
      credentials: { accessKeyId: '', secretAccessKey: '', existingSecretName: '' },
      s3: { bucket: '', region: '', root: '', endpoint: '', enableVirtualHostStyle: false },
      gcs: { bucket: '', scope: '', root: '', endpoint: '' },
      azblob: { container: '', endpoint: '', root: '' },
      oss: { bucket: '', region: '', root: '', endpoint: '' },
      cache: { enabled: false, cacheCapacity: '5Gi', storageClassName: '', storageSize: '10Gi' },
    } satisfies ObjectStorageConfig

    expect(isObjectStorageValid(storage)).toBe(false)

    storage.s3.bucket = 'bucket'
    storage.credentials.existingSecretName = 'storage-credentials'

    expect(isObjectStorageValid(storage)).toBe(false)

    storage.s3.region = 'us-west-2'
    storage.s3.root = 'greptimedb'

    expect(isObjectStorageValid(storage)).toBe(true)
  })

  it('requires at least one complete auth user when auth is enabled', () => {
    const enterprise: EnterpriseFeatures = {
      license: { enabled: false, data: '' },
      auth: { enabled: true, useBuiltIn: false, users: [] },
      remoteCompaction: {
        enabled: false,
        scheduler: { image: { registry: '', repository: '', tag: '' }, replicas: 1 },
        compactor: { image: { registry: '', repository: '', tag: '' }, replicas: 1 },
      },
      dashboard: { enabled: false, image: { registry: '', repository: '', tag: '' }, replicas: 1 },
      regionFailover: false,
    } satisfies EnterpriseFeatures

    expect(isEnterpriseValid(enterprise)).toBe(false)

    enterprise.auth.users.push({ username: 'admin', password: 'secret', permission: 'readwrite' })

    expect(isEnterpriseValid(enterprise)).toBe(true)
  })

  it('rejects remote compaction with object storage existing secret because child chart expects env keys', () => {
    const enterprise: EnterpriseFeatures = {
      license: { enabled: false, data: '' },
      auth: { enabled: false, useBuiltIn: false, users: [] },
      remoteCompaction: {
        enabled: true,
        scheduler: { image: { registry: '', repository: '', tag: '' }, replicas: 1 },
        compactor: { image: { registry: '', repository: '', tag: '' }, replicas: 1 },
      },
      dashboard: { enabled: false, image: { registry: '', repository: '', tag: '' }, replicas: 1 },
      regionFailover: false,
    }
    const storage: ObjectStorageConfig = {
      type: 's3',
      credentials: { accessKeyId: '', secretAccessKey: '', existingSecretName: 'storage-credentials' },
      s3: { bucket: 'bucket', region: 'us-west-2', root: 'greptimedb', endpoint: '', enableVirtualHostStyle: false },
      gcs: { bucket: '', scope: '', root: '', endpoint: '' },
      azblob: { container: '', endpoint: '', root: '' },
      oss: { bucket: '', region: '', root: '', endpoint: '' },
      cache: { enabled: false, cacheCapacity: '5Gi', storageClassName: '', storageSize: '10Gi' },
    }

    expect(isEnterpriseValid(enterprise, storage)).toBe(false)

    storage.credentials.existingSecretName = ''
    storage.credentials.accessKeyId = 'access-key'
    storage.credentials.secretAccessKey = 'secret-key'

    expect(isEnterpriseValid(enterprise, storage)).toBe(true)
  })

  it('requires tracing endpoint when tracing is enabled', () => {
    const monitoring = {
      monitoring: {
        enabled: false,
        resources: { cpu: '500m', memory: '512Mi' },
        objectStorage: {
          type: 'none',
          secretName: '',
          s3: { bucket: '', region: '', root: '', endpoint: '', enableVirtualHostStyle: false },
          gcs: { bucket: '', scope: '', root: '', endpoint: '' },
          azblob: { container: '', endpoint: '', root: '' },
          oss: { bucket: '', region: '', root: '', endpoint: '' },
          cache: { enabled: false, cacheCapacity: '5Gi', storageClassName: '', storageSize: '10Gi' },
        },
        datanodeStorage: { enabled: false, storageClassName: '', storageSize: '50Gi', storageRetainPolicy: 'Retain' },
      },
      grafana: { enabled: false, adminUser: 'admin', adminPassword: '', persistenceEnabled: false, persistenceSize: '1Gi' },
      jaeger: { enabled: false },
      tracing: { enabled: true, endpoint: '', sampleRatio: '1.0' },
      slowQuery: { enabled: true, threshold: '30s', ttl: '30d' },
      prometheus: { monitorEnabled: false, ruleEnabled: false },
    } satisfies MonitoringObservability

    expect(isMonitoringValid(monitoring)).toBe(false)

    monitoring.tracing.endpoint = 'http://jaeger:4317'

    expect(isMonitoringValid(monitoring)).toBe(true)
  })
})
