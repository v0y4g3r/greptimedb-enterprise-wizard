import type { EnterpriseFeatures, MetaBackendStorage, MonitoringObservability, MonitoringObjectStorageConfig, ObjectStorageConfig } from '../types/config'

function filled(value: string): boolean {
  return value.trim() !== ''
}

function credentialsFilled(credentials: { accessKeyId: string; secretAccessKey: string; existingSecretName: string }, provider: ObjectStorageConfig['type']): boolean {
  if (provider === 'gcs') {
    return filled(credentials.existingSecretName) || filled(credentials.secretAccessKey) || filled(credentials.accessKeyId)
  }

  return filled(credentials.existingSecretName) || (filled(credentials.accessKeyId) && filled(credentials.secretAccessKey))
}

export function isMetaBackendValid(backend: MetaBackendStorage): boolean {
  if (backend.type === 'etcd') {
    return backend.etcd.endpoints.length > 0 && backend.etcd.endpoints.every(filled)
  }

  if (backend.type === 'mysql') {
    const credentials = backend.mysql.credentials
    return filled(backend.mysql.host) && filled(backend.mysql.database) &&
      (filled(credentials.existingSecretName) || (filled(credentials.username) && filled(credentials.password)))
  }

  const credentials = backend.postgresql.credentials
  return filled(backend.postgresql.host) && filled(backend.postgresql.database) &&
    (filled(credentials.existingSecretName) || (filled(credentials.username) && filled(credentials.password)))
}

export function isObjectStorageValid(storage: ObjectStorageConfig): boolean {
  if (storage.type === 'none') return true

  const providerValid = storage.type === 's3'
    ? filled(storage.s3.bucket) && filled(storage.s3.region) && filled(storage.s3.root)
    : storage.type === 'gcs'
    ? filled(storage.gcs.bucket) && filled(storage.gcs.root)
    : storage.type === 'azblob'
    ? filled(storage.azblob.container) && filled(storage.azblob.root)
    : filled(storage.oss.bucket) && filled(storage.oss.region) && filled(storage.oss.root)

  return providerValid && credentialsFilled(storage.credentials, storage.type)
}

function isMonitoringObjectStorageValid(storage: MonitoringObjectStorageConfig): boolean {
  if (storage.type === 'none') return true

  const providerValid = storage.type === 's3'
    ? filled(storage.s3.bucket) && filled(storage.s3.region) && filled(storage.s3.root)
    : storage.type === 'gcs'
    ? filled(storage.gcs.bucket) && filled(storage.gcs.root)
    : storage.type === 'azblob'
    ? filled(storage.azblob.container) && filled(storage.azblob.root)
    : filled(storage.oss.bucket) && filled(storage.oss.region) && filled(storage.oss.root)

  return providerValid && filled(storage.secretName)
}

export function isEnterpriseValid(enterprise: EnterpriseFeatures, objectStorage?: ObjectStorageConfig): boolean {
  if (enterprise.auth.enabled) {
    if (enterprise.auth.users.length === 0 ||
      !enterprise.auth.users.every(user => filled(user.username) && filled(user.password))) {
      return false
    }
  }

  if (enterprise.remoteCompaction.enabled && objectStorage?.type !== undefined && objectStorage.type !== 'none') {
    if (filled(objectStorage.credentials.existingSecretName)) {
      return false
    }
  }

  return true
}

export function isMonitoringValid(config: MonitoringObservability): boolean {
  if (config.monitoring.enabled && !isMonitoringObjectStorageValid(config.monitoring.objectStorage)) {
    return false
  }

  if (config.tracing.enabled && !filled(config.tracing.endpoint)) {
    return false
  }

  return true
}
