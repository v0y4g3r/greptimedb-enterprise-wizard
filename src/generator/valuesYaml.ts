import type { AppConfig } from '../types/config'

function indent(str: string, level: number): string {
  const prefix = '  '.repeat(level)
  return str.split('\n').map(line => line ? prefix + line : line).join('\n')
}

function yamlKey(key: string, value: string | number | boolean): string {
  if (typeof value === 'string') {
    if (value.includes('\n')) {
      return `${key}: |\n${indent(value, 1)}`
    }
    if (value === '' || value.includes(':') || value.includes('#') || value.includes('{') || value.includes('[')) {
      return `${key}: "${value}"`
    }
    return `${key}: ${value}`
  }
  return `${key}: ${value}`
}

function yamlArray(key: string, items: string[]): string {
  if (items.length === 0) return ''
  const lines = items.map(item => `  - "${item}"`)
  return `${key}:\n${lines.join('\n')}`
}

export function generateValuesYaml(config: AppConfig): string {
  const sections: string[] = []

  // Image
  const imageLines: string[] = []
  imageLines.push(yamlKey('registry', config.image.registry))
  imageLines.push(yamlKey('repository', config.image.repository))
  imageLines.push(yamlKey('tag', config.image.tag))
  sections.push(`image:\n${indent(imageLines.join('\n'), 1)}`)

  // Custom Image Registry
  if (config.customImageRegistry.enabled) {
    const lines: string[] = []
    lines.push(yamlKey('enabled', true))
    lines.push(yamlKey('registry', config.customImageRegistry.registry))
    lines.push(yamlKey('username', config.customImageRegistry.username))
    lines.push(yamlKey('password', config.customImageRegistry.password))
    sections.push(`customImageRegistry:\n${indent(lines.join('\n'), 1)}`)
  }

  // Initializer
  const initLines: string[] = []
  initLines.push(yamlKey('registry', config.initializerImage.registry))
  initLines.push(yamlKey('repository', config.initializerImage.repository))
  initLines.push(yamlKey('tag', config.initializerImage.tag))
  sections.push(`initializer:\n${indent(initLines.join('\n'), 1)}`)

  // Frontend
  if (config.frontend.enabled) {
    const lines: string[] = []
    lines.push(yamlKey('enabled', true))
    lines.push(yamlKey('replicas', config.frontend.replicas))
    if (config.frontend.resources.requests.cpu !== '500m' || config.frontend.resources.requests.memory !== '512Mi' ||
        config.frontend.resources.limits.cpu !== '2' || config.frontend.resources.limits.memory !== '4Gi') {
      lines.push(`podTemplate:\n  main:\n    resources:\n      requests:\n        cpu: ${config.frontend.resources.requests.cpu}\n        memory: ${config.frontend.resources.requests.memory}\n      limits:\n        cpu: ${config.frontend.resources.limits.cpu}\n        memory: ${config.frontend.resources.limits.memory}`)
    }
    sections.push(`frontend:\n${indent(lines.join('\n'), 1)}`)
  } else {
    sections.push(`frontend:\n  enabled: false`)
  }

  // Meta
  {
    const lines: string[] = []
    lines.push(yamlKey('replicas', config.meta.replicas))
    if (config.meta.resources.requests.cpu !== '500m' || config.meta.resources.requests.memory !== '512Mi' ||
        config.meta.resources.limits.cpu !== '2' || config.meta.resources.limits.memory !== '4Gi') {
      lines.push(`podTemplate:\n  main:\n    resources:\n      requests:\n        cpu: ${config.meta.resources.requests.cpu}\n        memory: ${config.meta.resources.requests.memory}\n      limits:\n        cpu: ${config.meta.resources.limits.cpu}\n        memory: ${config.meta.resources.limits.memory}`)
    }

    // Backend storage
    if (config.meta.backendStorage.type === 'etcd') {
      const etcdLines: string[] = []
      if (config.meta.backendStorage.etcd.endpoints.length > 0) {
        etcdLines.push('endpoints:')
        config.meta.backendStorage.etcd.endpoints.forEach(ep => {
          etcdLines.push(`  - "${ep}"`)
        })
      }
      if (config.meta.backendStorage.etcd.storeKeyPrefix) {
        etcdLines.push(yamlKey('storeKeyPrefix', config.meta.backendStorage.etcd.storeKeyPrefix))
      }
      if (etcdLines.length > 0) {
        lines.push(`backendStorage:\n  etcd:\n${indent(etcdLines.join('\n'), 2)}`)
      }
    } else if (config.meta.backendStorage.type === 'mysql') {
      const mysqlLines: string[] = []
      mysqlLines.push(yamlKey('host', config.meta.backendStorage.mysql.host))
      mysqlLines.push(yamlKey('port', config.meta.backendStorage.mysql.port))
      mysqlLines.push(yamlKey('database', config.meta.backendStorage.mysql.database))
      mysqlLines.push(yamlKey('table', config.meta.backendStorage.mysql.table))
      const credLines: string[] = []
      if (config.meta.backendStorage.mysql.credentials.existingSecretName) {
        credLines.push(yamlKey('existingSecretName', config.meta.backendStorage.mysql.credentials.existingSecretName))
      } else {
        credLines.push(yamlKey('username', config.meta.backendStorage.mysql.credentials.username))
        credLines.push(yamlKey('password', config.meta.backendStorage.mysql.credentials.password))
      }
      mysqlLines.push(`credentials:\n${indent(credLines.join('\n'), 1)}`)
      lines.push(`backendStorage:\n  mysql:\n${indent(mysqlLines.join('\n'), 2)}`)
    } else if (config.meta.backendStorage.type === 'postgresql') {
      const pgLines: string[] = []
      pgLines.push(yamlKey('host', config.meta.backendStorage.postgresql.host))
      pgLines.push(yamlKey('port', config.meta.backendStorage.postgresql.port))
      pgLines.push(yamlKey('database', config.meta.backendStorage.postgresql.database))
      pgLines.push(yamlKey('table', config.meta.backendStorage.postgresql.table))
      if (config.meta.backendStorage.postgresql.electionLockID) {
        pgLines.push(yamlKey('electionLockID', config.meta.backendStorage.postgresql.electionLockID))
      }
      const credLines: string[] = []
      if (config.meta.backendStorage.postgresql.credentials.existingSecretName) {
        credLines.push(yamlKey('existingSecretName', config.meta.backendStorage.postgresql.credentials.existingSecretName))
      } else {
        credLines.push(yamlKey('username', config.meta.backendStorage.postgresql.credentials.username))
        credLines.push(yamlKey('password', config.meta.backendStorage.postgresql.credentials.password))
      }
      pgLines.push(`credentials:\n${indent(credLines.join('\n'), 1)}`)
      lines.push(`backendStorage:\n  postgresql:\n${indent(pgLines.join('\n'), 2)}`)
    }

    if (config.enterprise.regionFailover) {
      lines.push(yamlKey('enableRegionFailover', true))
    }

    sections.push(`meta:\n${indent(lines.join('\n'), 1)}`)
  }

  // Datanode
  if (config.datanode.enabled) {
    const lines: string[] = []
    lines.push(yamlKey('enabled', true))
    lines.push(yamlKey('replicas', config.datanode.replicas))
    if (config.datanode.resources.requests.cpu !== '500m' || config.datanode.resources.requests.memory !== '512Mi' ||
        config.datanode.resources.limits.cpu !== '2' || config.datanode.resources.limits.memory !== '4Gi') {
      lines.push(`podTemplate:\n  main:\n    resources:\n      requests:\n        cpu: ${config.datanode.resources.requests.cpu}\n        memory: ${config.datanode.resources.requests.memory}\n      limits:\n        cpu: ${config.datanode.resources.limits.cpu}\n        memory: ${config.datanode.resources.limits.memory}`)
    }
    const storageLines: string[] = []
    if (config.datanode.storage.storageClassName) {
      storageLines.push(yamlKey('storageClassName', config.datanode.storage.storageClassName))
    }
    storageLines.push(yamlKey('storageSize', config.datanode.storage.storageSize))
    storageLines.push(yamlKey('storageRetainPolicy', config.datanode.storage.storageRetainPolicy))
    lines.push(`storage:\n${indent(storageLines.join('\n'), 1)}`)
    sections.push(`datanode:\n${indent(lines.join('\n'), 1)}`)
  } else {
    sections.push(`datanode:\n  enabled: false`)
  }

  // Flownode
  if (config.flownode.enabled) {
    const lines: string[] = []
    lines.push(yamlKey('enabled', true))
    lines.push(yamlKey('replicas', config.flownode.replicas))
    if (config.flownode.resources.requests.cpu !== '500m' || config.flownode.resources.requests.memory !== '512Mi' ||
        config.flownode.resources.limits.cpu !== '2' || config.flownode.resources.limits.memory !== '4Gi') {
      lines.push(`podTemplate:\n  main:\n    resources:\n      requests:\n        cpu: ${config.flownode.resources.requests.cpu}\n        memory: ${config.flownode.resources.requests.memory}\n      limits:\n        cpu: ${config.flownode.resources.limits.cpu}\n        memory: ${config.flownode.resources.limits.memory}`)
    }
    sections.push(`flownode:\n${indent(lines.join('\n'), 1)}`)
  } else {
    sections.push(`flownode:\n  enabled: false`)
  }

  // Object Storage
  if (config.objectStorage.type !== 'none') {
    const lines: string[] = []
    const credLines: string[] = []

    if (config.objectStorage.credentials.existingSecretName) {
      credLines.push(yamlKey('existingSecretName', config.objectStorage.credentials.existingSecretName))
    } else {
      if (config.objectStorage.credentials.accessKeyId) {
        credLines.push(yamlKey('accessKeyId', config.objectStorage.credentials.accessKeyId))
      }
      if (config.objectStorage.credentials.secretAccessKey) {
        credLines.push(yamlKey('secretAccessKey', config.objectStorage.credentials.secretAccessKey))
      }
    }

    if (credLines.length > 0) {
      lines.push(`credentials:\n${indent(credLines.join('\n'), 1)}`)
    }

    if (config.objectStorage.type === 's3') {
      const s3Lines: string[] = []
      s3Lines.push(yamlKey('bucket', config.objectStorage.s3.bucket))
      if (config.objectStorage.s3.region) s3Lines.push(yamlKey('region', config.objectStorage.s3.region))
      if (config.objectStorage.s3.root) s3Lines.push(yamlKey('root', config.objectStorage.s3.root))
      if (config.objectStorage.s3.endpoint) s3Lines.push(yamlKey('endpoint', config.objectStorage.s3.endpoint))
      if (config.objectStorage.s3.enableVirtualHostStyle) s3Lines.push(yamlKey('enableVirtualHostStyle', true))
      lines.push(`s3:\n${indent(s3Lines.join('\n'), 1)}`)
    } else if (config.objectStorage.type === 'gcs') {
      const gcsLines: string[] = []
      gcsLines.push(yamlKey('bucket', config.objectStorage.gcs.bucket))
      if (config.objectStorage.gcs.scope) gcsLines.push(yamlKey('scope', config.objectStorage.gcs.scope))
      if (config.objectStorage.gcs.root) gcsLines.push(yamlKey('root', config.objectStorage.gcs.root))
      if (config.objectStorage.gcs.endpoint) gcsLines.push(yamlKey('endpoint', config.objectStorage.gcs.endpoint))
      lines.push(`gcs:\n${indent(gcsLines.join('\n'), 1)}`)
    } else if (config.objectStorage.type === 'azblob') {
      const azLines: string[] = []
      azLines.push(yamlKey('container', config.objectStorage.azblob.container))
      if (config.objectStorage.azblob.endpoint) azLines.push(yamlKey('endpoint', config.objectStorage.azblob.endpoint))
      if (config.objectStorage.azblob.root) azLines.push(yamlKey('root', config.objectStorage.azblob.root))
      lines.push(`azblob:\n${indent(azLines.join('\n'), 1)}`)
    } else if (config.objectStorage.type === 'oss') {
      const ossLines: string[] = []
      ossLines.push(yamlKey('bucket', config.objectStorage.oss.bucket))
      if (config.objectStorage.oss.region) ossLines.push(yamlKey('region', config.objectStorage.oss.region))
      if (config.objectStorage.oss.root) ossLines.push(yamlKey('root', config.objectStorage.oss.root))
      if (config.objectStorage.oss.endpoint) ossLines.push(yamlKey('endpoint', config.objectStorage.oss.endpoint))
      lines.push(`oss:\n${indent(ossLines.join('\n'), 1)}`)
    }

    // Cache
    if (config.objectStorage.cache.enabled) {
      const cacheLines: string[] = []
      cacheLines.push(yamlKey('cacheCapacity', config.objectStorage.cache.cacheCapacity))
      if (config.objectStorage.cache.storageClassName || config.objectStorage.cache.storageSize) {
        const fsLines: string[] = []
        if (config.objectStorage.cache.storageClassName) {
          fsLines.push(yamlKey('storageClassName', config.objectStorage.cache.storageClassName))
        }
        fsLines.push(yamlKey('storageSize', config.objectStorage.cache.storageSize))
        cacheLines.push(`fs:\n${indent(fsLines.join('\n'), 1)}`)
      }
      lines.push(`cache:\n${indent(cacheLines.join('\n'), 1)}`)
    }

    sections.push(`objectStorage:\n${indent(lines.join('\n'), 1)}`)
  }

  // WAL
  if (config.wal.remote.enabled) {
    const lines: string[] = []
    lines.push(yamlKey('enabled', true))
    if (config.wal.remote.kafkaBrokerEndpoints.length > 0) {
      lines.push(`kafka:\n  brokerEndpoints:\n${config.wal.remote.kafkaBrokerEndpoints.map(ep => `    - "${ep}"`).join('\n')}`)
    }
    sections.push(`remoteWal:\n${indent(lines.join('\n'), 1)}`)
  }

  if (config.wal.dedicated.enabled) {
    const lines: string[] = []
    lines.push(yamlKey('enabled', true))
    const fsLines: string[] = []
    if (config.wal.dedicated.storage.storageClassName) {
      fsLines.push(yamlKey('storageClassName', config.wal.dedicated.storage.storageClassName))
    }
    fsLines.push(yamlKey('storageSize', config.wal.dedicated.storage.storageSize))
    lines.push(`raftEngine:\n  fs:\n${indent(fsLines.join('\n'), 2)}`)
    sections.push(`dedicatedWAL:\n${indent(lines.join('\n'), 1)}`)
  }

  // Enterprise: License
  if (config.enterprise.license.enabled) {
    const lines: string[] = []
    lines.push(yamlKey('enabled', true))
    if (config.enterprise.license.data) {
      lines.push(yamlKey('data', config.enterprise.license.data))
    }
    sections.push(`license:\n${indent(lines.join('\n'), 1)}`)
  }

  // Enterprise: Auth
  if (config.enterprise.auth.enabled) {
    const lines: string[] = []
    lines.push(yamlKey('enabled', true))
    lines.push(yamlKey('useBuiltIn', config.enterprise.auth.useBuiltIn))
    if (config.enterprise.auth.users.length > 0) {
      lines.push('users:')
      config.enterprise.auth.users.forEach(u => {
        lines.push(`  - username: "${u.username}"`)
        lines.push(`    password: "${u.password}"`)
        lines.push(`    permission: "${u.permission}"`)
      })
    }
    sections.push(`auth:\n${indent(lines.join('\n'), 1)}`)
  }

  // Enterprise: Remote Compaction
  if (config.enterprise.remoteCompaction.enabled) {
    const lines: string[] = []
    lines.push(yamlKey('enabled', true))
    sections.push(`greptimedb-remote-compaction:\n${indent(lines.join('\n'), 1)}`)
  }

  // Enterprise: Dashboard
  if (config.enterprise.dashboard.enabled) {
    const lines: string[] = []
    lines.push(yamlKey('enabled', true))
    sections.push(`greptimedb-enterprise-dashboard:\n${indent(lines.join('\n'), 1)}`)
  }

  // Monitoring
  if (config.monitoringObservability.monitoring.enabled) {
    const lines: string[] = []
    lines.push(yamlKey('enabled', true))
    sections.push(`monitoring:\n${indent(lines.join('\n'), 1)}`)
  }

  // Grafana
  if (config.monitoringObservability.grafana.enabled) {
    const lines: string[] = []
    lines.push(yamlKey('enabled', true))
    lines.push(yamlKey('adminUser', config.monitoringObservability.grafana.adminUser))
    if (config.monitoringObservability.grafana.adminPassword) {
      lines.push(yamlKey('adminPassword', config.monitoringObservability.grafana.adminPassword))
    }
    if (config.monitoringObservability.grafana.persistenceEnabled) {
      lines.push(`persistence:\n  enabled: true\n  size: ${config.monitoringObservability.grafana.persistenceSize}`)
    }
    sections.push(`grafana:\n${indent(lines.join('\n'), 1)}`)
  }

  // Jaeger
  if (config.monitoringObservability.jaeger.enabled) {
    sections.push(`jaeger-all-in-one:\n  enabled: true`)
  }

  // Tracing
  if (config.monitoringObservability.tracing.enabled) {
    const lines: string[] = []
    lines.push(yamlKey('enabled', true))
    lines.push(yamlKey('endpoint', config.monitoringObservability.tracing.endpoint))
    lines.push(yamlKey('sampleRatio', config.monitoringObservability.tracing.sampleRatio))
    sections.push(`tracing:\n${indent(lines.join('\n'), 1)}`)
  }

  // Slow Query
  if (config.monitoringObservability.slowQuery.enabled) {
    const lines: string[] = []
    lines.push(yamlKey('enabled', true))
    lines.push(yamlKey('threshold', config.monitoringObservability.slowQuery.threshold))
    lines.push(yamlKey('ttl', config.monitoringObservability.slowQuery.ttl))
    sections.push(`slowQuery:\n${indent(lines.join('\n'), 1)}`)
  }

  // Prometheus
  if (config.monitoringObservability.prometheus.monitorEnabled || config.monitoringObservability.prometheus.ruleEnabled) {
    if (config.monitoringObservability.prometheus.monitorEnabled) {
      sections.push(`prometheusMonitor:\n  enabled: true`)
    }
    if (config.monitoringObservability.prometheus.ruleEnabled) {
      sections.push(`prometheusRule:\n  enabled: true`)
    }
  }

  // Logging
  if (config.logging.level !== 'info' || config.logging.format !== 'text') {
    const lines: string[] = []
    if (config.logging.level !== 'info') lines.push(yamlKey('level', config.logging.level))
    if (config.logging.format !== 'text') lines.push(yamlKey('format', config.logging.format))
    sections.push(`logging:\n${indent(lines.join('\n'), 1)}`)
  }

  // Ingress
  if (config.ingress.enabled) {
    const lines: string[] = []
    if (config.ingress.ingressClassName) {
      lines.push(yamlKey('ingressClassName', config.ingress.ingressClassName))
    }
    if (config.ingress.rules.length > 0) {
      lines.push('rules:')
      config.ingress.rules.forEach(rule => {
        lines.push(`  - host: "${rule.host}"`)
        if (rule.path) lines.push(`    path: "${rule.path}"`)
      })
    }
    sections.push(`ingress:\n${indent(lines.join('\n'), 1)}`)
  }

  return sections.join('\n\n') + '\n'
}
