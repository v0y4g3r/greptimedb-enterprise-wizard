import type { AppConfig, ObjectStorageConfig } from '../types/config'

function indent(str: string, level: number): string {
  const prefix = '  '.repeat(level)
  return str.split('\n').map(line => line ? prefix + line : line).join('\n')
}

function yamlKey(key: string, value: string | number | boolean): string {
  if (typeof value === 'string') {
    if (value.includes('\n')) {
      return `${key}: |\n${indent(value, 1)}`
    }
    return `${key}: ${JSON.stringify(value)}`
  }
  return `${key}: ${value}`
}

function yamlString(value: string): string {
  return JSON.stringify(value)
}

function yamlArray(key: string, items: string[]): string {
  if (items.length === 0) return ''
  const lines = items.map(item => `  - ${yamlString(item)}`)
  return `${key}:\n${lines.join('\n')}`
}

function objectStorageCredentialLines(storage: ObjectStorageConfig, includeExistingSecret = true): string[] {
  const lines: string[] = []

  if (includeExistingSecret && storage.credentials.existingSecretName) {
    lines.push(yamlKey('existingSecretName', storage.credentials.existingSecretName))
  } else if (storage.type === 'azblob') {
    if (storage.credentials.accessKeyId) lines.push(yamlKey('accountName', storage.credentials.accessKeyId))
    if (storage.credentials.secretAccessKey) lines.push(yamlKey('accountKey', storage.credentials.secretAccessKey))
  } else if (storage.type === 'oss') {
    if (storage.credentials.accessKeyId) lines.push(yamlKey('accessKeyId', storage.credentials.accessKeyId))
    if (storage.credentials.secretAccessKey) lines.push(yamlKey('accessKeySecret', storage.credentials.secretAccessKey))
  } else if (storage.type === 'gcs') {
    if (storage.credentials.secretAccessKey || storage.credentials.accessKeyId) {
      lines.push(yamlKey('serviceAccountKey', storage.credentials.secretAccessKey || storage.credentials.accessKeyId))
    }
  } else {
    if (storage.credentials.accessKeyId) lines.push(yamlKey('accessKeyId', storage.credentials.accessKeyId))
    if (storage.credentials.secretAccessKey) lines.push(yamlKey('secretAccessKey', storage.credentials.secretAccessKey))
  }

  return lines
}

function objectStorageLines(storage: ObjectStorageConfig, includeCache: boolean, includeExistingSecret = true): string[] {
  const lines: string[] = []
  const credLines = objectStorageCredentialLines(storage, includeExistingSecret)

  if (credLines.length > 0) {
    lines.push(`credentials:\n${indent(credLines.join('\n'), 1)}`)
  }

  if (storage.type === 's3') {
    const s3Lines: string[] = []
    s3Lines.push(yamlKey('bucket', storage.s3.bucket))
    s3Lines.push(yamlKey('region', storage.s3.region))
    s3Lines.push(yamlKey('root', storage.s3.root))
    if (storage.s3.endpoint) s3Lines.push(yamlKey('endpoint', storage.s3.endpoint))
    if (storage.s3.enableVirtualHostStyle) s3Lines.push(yamlKey('enableVirtualHostStyle', true))
    lines.push(`s3:\n${indent(s3Lines.join('\n'), 1)}`)
  } else if (storage.type === 'gcs') {
    const gcsLines: string[] = []
    gcsLines.push(yamlKey('bucket', storage.gcs.bucket))
    if (storage.gcs.scope) gcsLines.push(yamlKey('scope', storage.gcs.scope))
    gcsLines.push(yamlKey('root', storage.gcs.root))
    if (storage.gcs.endpoint) gcsLines.push(yamlKey('endpoint', storage.gcs.endpoint))
    lines.push(`gcs:\n${indent(gcsLines.join('\n'), 1)}`)
  } else if (storage.type === 'azblob') {
    const azLines: string[] = []
    azLines.push(yamlKey('container', storage.azblob.container))
    if (storage.azblob.endpoint) azLines.push(yamlKey('endpoint', storage.azblob.endpoint))
    azLines.push(yamlKey('root', storage.azblob.root))
    lines.push(`azblob:\n${indent(azLines.join('\n'), 1)}`)
  } else if (storage.type === 'oss') {
    const ossLines: string[] = []
    ossLines.push(yamlKey('bucket', storage.oss.bucket))
    ossLines.push(yamlKey('region', storage.oss.region))
    ossLines.push(yamlKey('root', storage.oss.root))
    if (storage.oss.endpoint) ossLines.push(yamlKey('endpoint', storage.oss.endpoint))
    lines.push(`oss:\n${indent(ossLines.join('\n'), 1)}`)
  }

  if (includeCache && storage.cache.enabled) {
    const cacheLines: string[] = []
    cacheLines.push(yamlKey('cacheCapacity', storage.cache.cacheCapacity))
    const fsLines: string[] = []
    if (storage.cache.storageClassName) fsLines.push(yamlKey('storageClassName', storage.cache.storageClassName))
    fsLines.push(yamlKey('name', 'cache'))
    fsLines.push(yamlKey('storageSize', storage.cache.storageSize))
    fsLines.push(yamlKey('mountPath', '/cache'))
    cacheLines.push(`fs:\n${indent(fsLines.join('\n'), 1)}`)
    lines.push(`cache:\n${indent(cacheLines.join('\n'), 1)}`)
  }

  return lines
}

export function generateValuesYaml(config: AppConfig): string {
  const sections: string[] = []

  // Image
  const imageLines: string[] = []
  imageLines.push(yamlKey('registry', config.customImageRegistry.registry))
  imageLines.push(yamlKey('repository', config.image.repository))
  imageLines.push(yamlKey('tag', config.image.tag))
  imageLines.push(`pullSecrets:\n  - "greptimedb-custom-image-pull-secret"`)
  sections.push(`image:\n${indent(imageLines.join('\n'), 1)}`)

  // Custom Image Registry
  {
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
    if (config.frontend.resources.requests.cpu || config.frontend.resources.requests.memory ||
        config.frontend.resources.limits.cpu || config.frontend.resources.limits.memory) {
      lines.push(`podTemplate:\n  main:\n    resources:\n      requests:\n        cpu: ${config.frontend.resources.requests.cpu}\n        memory: ${config.frontend.resources.requests.memory}\n      limits:\n        cpu: ${config.frontend.resources.limits.cpu}\n        memory: ${config.frontend.resources.limits.memory}`)
    }
    if (config.frontend.configData.trim()) {
      lines.push(`configData: |\n${indent(config.frontend.configData, 1)}`)
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
          etcdLines.push(`  - ${yamlString(ep)}`)
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
        credLines.push(yamlKey('secretName', 'meta-mysql-credentials'))
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
        credLines.push(yamlKey('secretName', 'meta-postgresql-credentials'))
        credLines.push(yamlKey('username', config.meta.backendStorage.postgresql.credentials.username))
        credLines.push(yamlKey('password', config.meta.backendStorage.postgresql.credentials.password))
      }
      pgLines.push(`credentials:\n${indent(credLines.join('\n'), 1)}`)
      lines.push(`backendStorage:\n  postgresql:\n${indent(pgLines.join('\n'), 2)}`)
    }

    if (config.enterprise.regionFailover) {
      lines.push(yamlKey('enableRegionFailover', true))
    }

    if (config.meta.configData.trim()) {
      lines.push(`configData: |\n${indent(config.meta.configData, 1)}`)
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
    if (config.datanode.configData.trim()) {
      lines.push(`configData: |\n${indent(config.datanode.configData, 1)}`)
    }
    sections.push(`datanode:\n${indent(lines.join('\n'), 1)}`)
  } else {
    sections.push(`datanode:\n  enabled: false`)
  }

  // Flownode
  if (config.flownode.enabled) {
    const lines: string[] = []
    lines.push(yamlKey('enabled', true))
    lines.push(yamlKey('replicas', config.flownode.replicas))
    if (config.flownode.resources.requests.cpu || config.flownode.resources.requests.memory ||
        config.flownode.resources.limits.cpu || config.flownode.resources.limits.memory) {
      lines.push(`podTemplate:\n  main:\n    resources:\n      requests:\n        cpu: ${config.flownode.resources.requests.cpu}\n        memory: ${config.flownode.resources.requests.memory}\n      limits:\n        cpu: ${config.flownode.resources.limits.cpu}\n        memory: ${config.flownode.resources.limits.memory}`)
    }
    if (config.flownode.configData.trim()) {
      lines.push(`configData: |\n${indent(config.flownode.configData, 1)}`)
    }
    sections.push(`flownode:\n${indent(lines.join('\n'), 1)}`)
  } else {
    sections.push(`flownode:\n  enabled: false`)
  }

  // Object Storage
  if (config.objectStorage.type !== 'none') {
    const lines = objectStorageLines(config.objectStorage, true)
    sections.push(`objectStorage:\n${indent(lines.join('\n'), 1)}`)
  }

  // WAL
  if (config.wal.remote.enabled) {
    const lines: string[] = []
    lines.push(yamlKey('enabled', true))
    if (config.wal.remote.kafkaBrokerEndpoints.length > 0) {
      lines.push(`kafka:\n  brokerEndpoints:\n${config.wal.remote.kafkaBrokerEndpoints.map(ep => `    - ${yamlString(ep)}`).join('\n')}`)
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
        lines.push(`  - username: ${yamlString(u.username)}`)
        lines.push(`    password: ${yamlString(u.password)}`)
        lines.push(`    permission: ${yamlString(u.permission)}`)
      })
    }
    sections.push(`auth:\n${indent(lines.join('\n'), 1)}`)
  }

  // Enterprise: Remote Compaction
  if (config.enterprise.remoteCompaction.enabled) {
    const lines: string[] = []
    lines.push(yamlKey('enabled', true))
    lines.push(`scheduler:\n  image:\n    registry: ${yamlString(config.enterprise.remoteCompaction.scheduler.image.registry)}\n    repository: ${yamlString(config.enterprise.remoteCompaction.scheduler.image.repository)}\n    tag: ${yamlString(config.enterprise.remoteCompaction.scheduler.image.tag)}\n  replicas: ${config.enterprise.remoteCompaction.scheduler.replicas}`)
    const compactorLines = [
      `image:\n  registry: ${yamlString(config.enterprise.remoteCompaction.compactor.image.registry)}\n  repository: ${yamlString(config.enterprise.remoteCompaction.compactor.image.repository)}\n  tag: ${yamlString(config.enterprise.remoteCompaction.compactor.image.tag)}`,
      yamlKey('replicas', config.enterprise.remoteCompaction.compactor.replicas),
    ]
    if (config.objectStorage.type !== 'none') {
      compactorLines.push(`objectStorage:\n${indent(objectStorageLines(config.objectStorage, false, false).join('\n'), 1)}`)
    }
    lines.push(`compactor:\n${indent(compactorLines.join('\n'), 1)}`)
    sections.push(`greptimedb-remote-compaction:\n${indent(lines.join('\n'), 1)}`)
  }

  // Enterprise: Dashboard
  if (config.enterprise.dashboard.enabled) {
    const lines: string[] = []
    lines.push(yamlKey('enabled', true))
    lines.push(yamlKey('replicaCount', config.enterprise.dashboard.replicas))
    const dashboardRepository = config.enterprise.dashboard.image.registry
      ? `${config.enterprise.dashboard.image.registry}/${config.enterprise.dashboard.image.repository}`
      : config.enterprise.dashboard.image.repository
    lines.push(`image:\n  repository: ${yamlString(dashboardRepository)}\n  tag: ${yamlString(config.enterprise.dashboard.image.tag)}`)
    lines.push(`config: |\n${indent(`servicePort: 19095\nlogLevel: info\nprovisionedInstances:\n- name: ${config.clusterName}\n  namespace: ${config.clusterNamespace}\n  type: cluster\n  url: http://${config.clusterName}-frontend.${config.clusterNamespace}.svc.cluster.local:4000\n  monitoring:\n    greptimedb:\n      url: http://${config.clusterName}-monitor-standalone.${config.clusterNamespace}.svc.cluster.local:4000`, 1)}`)
    sections.push(`greptimedb-enterprise-dashboard:\n${indent(lines.join('\n'), 1)}`)
  }

  // Monitoring
  if (config.monitoringObservability.monitoring.enabled) {
    const lines: string[] = []
    lines.push(yamlKey('enabled', true))

    // Standalone storage
    const standaloneLines: string[] = []
    const mon = config.monitoringObservability.monitoring

    if (mon.resources.cpu || mon.resources.memory) {
      standaloneLines.push(`base:\n  main:\n    resources:\n      requests:\n        cpu: ${yamlString(mon.resources.cpu)}\n        memory: ${yamlString(mon.resources.memory)}\n      limits:\n        cpu: ${yamlString(mon.resources.cpu)}\n        memory: ${yamlString(mon.resources.memory)}`)
    }

    // Object storage
    if (mon.objectStorage.type !== 'none') {
      const osLines: string[] = []
      const providerLines: string[] = []
      if (mon.objectStorage.type === 's3') {
        providerLines.push(yamlKey('bucket', mon.objectStorage.s3.bucket))
        providerLines.push(yamlKey('region', mon.objectStorage.s3.region))
        providerLines.push(yamlKey('root', mon.objectStorage.s3.root))
        if (mon.objectStorage.s3.endpoint) providerLines.push(yamlKey('endpoint', mon.objectStorage.s3.endpoint))
        if (mon.objectStorage.s3.enableVirtualHostStyle) providerLines.push(yamlKey('enableVirtualHostStyle', true))
      } else if (mon.objectStorage.type === 'gcs') {
        providerLines.push(yamlKey('bucket', mon.objectStorage.gcs.bucket))
        if (mon.objectStorage.gcs.scope) providerLines.push(yamlKey('scope', mon.objectStorage.gcs.scope))
        providerLines.push(yamlKey('root', mon.objectStorage.gcs.root))
        if (mon.objectStorage.gcs.endpoint) providerLines.push(yamlKey('endpoint', mon.objectStorage.gcs.endpoint))
      } else if (mon.objectStorage.type === 'azblob') {
        providerLines.push(yamlKey('container', mon.objectStorage.azblob.container))
        if (mon.objectStorage.azblob.endpoint) providerLines.push(yamlKey('endpoint', mon.objectStorage.azblob.endpoint))
        providerLines.push(yamlKey('root', mon.objectStorage.azblob.root))
      } else if (mon.objectStorage.type === 'oss') {
        providerLines.push(yamlKey('bucket', mon.objectStorage.oss.bucket))
        providerLines.push(yamlKey('region', mon.objectStorage.oss.region))
        providerLines.push(yamlKey('root', mon.objectStorage.oss.root))
        if (mon.objectStorage.oss.endpoint) providerLines.push(yamlKey('endpoint', mon.objectStorage.oss.endpoint))
      }
      if (mon.objectStorage.secretName) {
        providerLines.push(yamlKey('secretName', mon.objectStorage.secretName))
      }
      if (providerLines.length > 0) {
        osLines.push(`${mon.objectStorage.type}:\n${indent(providerLines.join('\n'), 1)}`)
      }

      // Cache
      if (mon.objectStorage.cache.enabled) {
        const cacheLines: string[] = []
        cacheLines.push(yamlKey('cacheCapacity', mon.objectStorage.cache.cacheCapacity))
        const fsLines: string[] = []
        if (mon.objectStorage.cache.storageClassName) {
          fsLines.push(yamlKey('storageClassName', mon.objectStorage.cache.storageClassName))
        }
        fsLines.push(yamlKey('name', 'cache'))
        fsLines.push(yamlKey('storageSize', mon.objectStorage.cache.storageSize))
        fsLines.push(yamlKey('mountPath', '/cache'))
        cacheLines.push(`fs:\n${indent(fsLines.join('\n'), 1)}`)
        osLines.push(`cache:\n${indent(cacheLines.join('\n'), 1)}`)
      }

      if (osLines.length > 0) {
        standaloneLines.push(`objectStorage:\n${indent(osLines.join('\n'), 1)}`)
      }
    }

    // Datanode storage
    if (mon.datanodeStorage.enabled) {
      const dsLines: string[] = []
      if (mon.datanodeStorage.storageClassName) {
        dsLines.push(yamlKey('storageClassName', mon.datanodeStorage.storageClassName))
      }
      dsLines.push(yamlKey('storageSize', mon.datanodeStorage.storageSize))
      dsLines.push(yamlKey('storageRetainPolicy', mon.datanodeStorage.storageRetainPolicy))
      standaloneLines.push(`datanodeStorage:\n  fs:\n${indent(dsLines.join('\n'), 2)}`)
    }

    if (standaloneLines.length > 0) {
      lines.push(`standalone:\n${indent(standaloneLines.join('\n'), 1)}`)
    }

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
        lines.push(`  - host: ${yamlString(rule.host)}`)
        if (rule.path) lines.push(`    path: ${yamlString(rule.path)}`)
      })
    }
    sections.push(`ingress:\n${indent(lines.join('\n'), 1)}`)
  }

  const releaseName = config.clusterName.replace(/[\r\n]/g, ' ').trim()
  const header = releaseName
    ? `# Use this values file with Helm release name: ${releaseName}\n# Example: helm install ${releaseName} greptime/greptimedb-cluster -f values.yaml\n\n`
    : ''

  return header + sections.join('\n\n') + '\n'
}
