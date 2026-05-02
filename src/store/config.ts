import { reactive, watch } from 'vue'
import type { AppConfig } from '../types/config'

const STORAGE_KEY = 'greptimedb-configurator'

const defaults: AppConfig = {
  clusterName: 'greptimedb',
  image: {
    registry: '',
    repository: 'greptime/greptimedb',
    tag: 'v1.0.1',
  },
  customImageRegistry: {
    enabled: true,
    registry: '',
    username: '',
    password: '',
  },
  initializerImage: {
    registry: 'docker.io',
    repository: 'greptime/greptimedb-initializer',
    tag: 'v0.5.5',
  },
  frontend: {
    enabled: true,
    replicas: 1,
    resources: {
      requests: { cpu: '500m', memory: '512Mi' },
      limits: { cpu: '8', memory: '16Gi' },
    },
    configData: '',
  },
  meta: {
    replicas: 1,
    resources: {
      requests: { cpu: '500m', memory: '512Mi' },
      limits: { cpu: '2', memory: '4Gi' },
    },
    configData: '',
    backendStorage: {
      type: 'etcd',
      etcd: {
        endpoints: ['etcd.etcd-cluster.svc.cluster.local:2379'],
        storeKeyPrefix: '',
      },
      mysql: {
        host: '',
        port: 3306,
        database: '',
        table: '',
        credentials: {
          username: '',
          password: '',
          existingSecretName: '',
        },
      },
      postgresql: {
        host: '',
        port: 5432,
        database: '',
        table: '',
        electionLockID: '',
        credentials: {
          username: '',
          password: '',
          existingSecretName: '',
        },
      },
    },
  },
  datanode: {
    enabled: true,
    replicas: 3,
    resources: {
      requests: { cpu: '500m', memory: '512Mi' },
      limits: { cpu: '8', memory: '16Gi' },
    },
    storage: {
      storageClassName: '',
      storageSize: '20Gi',
      storageRetainPolicy: 'Retain',
    },
    configData: '',
  },
  flownode: {
    enabled: false,
    replicas: 1,
    resources: {
      requests: { cpu: '500m', memory: '512Mi' },
      limits: { cpu: '2', memory: '4Gi' },
    },
    configData: '',
  },
  objectStorage: {
    type: 'none',
    credentials: {
      accessKeyId: '',
      secretAccessKey: '',
      existingSecretName: '',
    },
    s3: {
      bucket: '',
      region: '',
      root: '',
      endpoint: '',
      enableVirtualHostStyle: false,
    },
    gcs: {
      bucket: '',
      scope: '',
      root: '',
      endpoint: '',
    },
    azblob: {
      container: '',
      endpoint: '',
      root: '',
    },
    oss: {
      bucket: '',
      region: '',
      root: '',
      endpoint: '',
    },
    cache: {
      enabled: false,
      cacheCapacity: '5Gi',
      storageClassName: '',
      storageSize: '10Gi',
    },
  },
  wal: {
    remote: {
      enabled: false,
      kafkaBrokerEndpoints: [],
    },
    dedicated: {
      enabled: false,
      storage: {
        storageClassName: '',
        storageSize: '20Gi',
      },
    },
  },
  enterprise: {
    license: {
      enabled: false,
      data: '',
    },
    auth: {
      enabled: false,
      useBuiltIn: false,
      users: [],
    },
    remoteCompaction: {
      enabled: false,
      scheduler: {
        image: {
          registry: 'docker.io',
          repository: 'greptime/greptimedb-remote-compaction-scheduler',
          tag: 'latest',
        },
        replicas: 1,
      },
      compactor: {
        image: {
          registry: 'docker.io',
          repository: 'greptime/greptimedb-remote-compaction-compactor',
          tag: 'latest',
        },
        replicas: 1,
      },
    },
    dashboard: {
      enabled: false,
      image: {
        registry: 'docker.io',
        repository: 'greptime/greptimedb-enterprise-dashboard',
        tag: 'latest',
      },
      replicas: 1,
    },
    regionFailover: false,
  },
  monitoringObservability: {
    monitoring: {
      enabled: false,
      resources: {
        cpu: '500m',
        memory: '512Mi',
      },
    },
    grafana: {
      enabled: false,
      adminUser: 'admin',
      adminPassword: '',
      persistenceEnabled: false,
      persistenceSize: '1Gi',
    },
    jaeger: {
      enabled: false,
    },
    tracing: {
      enabled: false,
      endpoint: '',
      sampleRatio: '1.0',
    },
    slowQuery: {
      enabled: true,
      threshold: '30s',
      ttl: '30d',
    },
    prometheus: {
      monitorEnabled: false,
      ruleEnabled: false,
    },
  },
  logging: {
    level: 'info',
    format: 'text',
  },
  ingress: {
    enabled: false,
    ingressClassName: '',
    rules: [],
  },
}

function deepMerge(target: any, source: any): any {
  for (const key of Object.keys(source)) {
    if (
      source[key] && typeof source[key] === 'object' && !Array.isArray(source[key]) &&
      target[key] && typeof target[key] === 'object' && !Array.isArray(target[key])
    ) {
      deepMerge(target[key], source[key])
    } else if (key in target) {
      target[key] = source[key]
    }
  }
  return target
}

function loadSavedConfig(): AppConfig {
  const merged = JSON.parse(JSON.stringify(defaults))
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const saved = JSON.parse(raw)
      deepMerge(merged, saved)
    }
  } catch { /* ignore corrupt storage */ }
  return merged
}

export const config: AppConfig = reactive(loadSavedConfig())

let saveTimer: ReturnType<typeof setTimeout> | null = null
watch(
  () => config,
  () => {
    if (saveTimer) clearTimeout(saveTimer)
    saveTimer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
      } catch { /* quota exceeded, ignore */ }
    }, 500)
  },
  { deep: true },
)

export function resetConfig() {
  const fresh = JSON.parse(JSON.stringify(defaults))
  Object.assign(config, fresh)
  localStorage.removeItem(STORAGE_KEY)
}

export const steps = [
  { id: 1, title: 'Cluster Basics', description: 'Image and naming' },
  { id: 2, title: 'Components', description: 'Enable components and set required resource requests/limits' },
  { id: 3, title: 'Meta Backend', description: 'etcd, MySQL, or PostgreSQL' },
  { id: 4, title: 'Object Storage', description: 'S3, GCS, Azure, OSS' },
  { id: 5, title: 'WAL Configuration', description: 'Local or Remote (Kafka)' },
  { id: 6, title: 'Enterprise Features', description: 'License, Auth, Dashboard' },
  { id: 7, title: 'Monitoring', description: 'Grafana, Jaeger, Tracing' },
  { id: 8, title: 'Review & Generate', description: 'Download values.yaml' },
]
