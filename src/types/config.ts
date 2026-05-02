export interface ResourceRequests {
  cpu: string
  memory: string
}

export interface ResourceLimits {
  cpu: string
  memory: string
}

export interface Resources {
  requests: ResourceRequests
  limits: ResourceLimits
}

export interface ImageConfig {
  registry: string
  repository: string
  tag: string
}

export interface CustomImageRegistry {
  enabled: boolean
  registry: string
  username: string
  password: string
}

export interface ComponentConfig {
  enabled: boolean
  replicas: number
  resources: Resources
  configData: string
}

export interface DatanodeStorage {
  storageClassName: string
  storageSize: string
  storageRetainPolicy: string
}

export interface DatanodeConfig extends ComponentConfig {
  storage: DatanodeStorage
}

export interface EtcdBackend {
  endpoints: string[]
  storeKeyPrefix: string
}

export interface MysqlCredentials {
  username: string
  password: string
  existingSecretName: string
}

export interface MysqlBackend {
  host: string
  port: number
  database: string
  table: string
  credentials: MysqlCredentials
}

export interface PostgresqlCredentials {
  username: string
  password: string
  existingSecretName: string
}

export interface PostgresqlBackend {
  host: string
  port: number
  database: string
  table: string
  electionLockID: string
  credentials: PostgresqlCredentials
}

export interface MetaBackendStorage {
  type: 'etcd' | 'mysql' | 'postgresql'
  etcd: EtcdBackend
  mysql: MysqlBackend
  postgresql: PostgresqlBackend
}

export interface ObjectStorageCredentials {
  accessKeyId: string
  secretAccessKey: string
  existingSecretName: string
}

export interface S3Config {
  bucket: string
  region: string
  root: string
  endpoint: string
  enableVirtualHostStyle: boolean
}

export interface GcsConfig {
  bucket: string
  scope: string
  root: string
  endpoint: string
}

export interface AzblobConfig {
  container: string
  endpoint: string
  root: string
}

export interface OssConfig {
  bucket: string
  region: string
  root: string
  endpoint: string
}

export interface ObjectStorageCache {
  enabled: boolean
  cacheCapacity: string
  storageClassName: string
  storageSize: string
}

export interface ObjectStorageConfig {
  type: 'none' | 's3' | 'gcs' | 'azblob' | 'oss'
  credentials: ObjectStorageCredentials
  s3: S3Config
  gcs: GcsConfig
  azblob: AzblobConfig
  oss: OssConfig
  cache: ObjectStorageCache
}

export interface RemoteWalConfig {
  enabled: boolean
  kafkaBrokerEndpoints: string[]
}

export interface DedicatedWalStorage {
  storageClassName: string
  storageSize: string
}

export interface DedicatedWalConfig {
  enabled: boolean
  storage: DedicatedWalStorage
}

export interface WalConfig {
  remote: RemoteWalConfig
  dedicated: DedicatedWalConfig
}

export interface LicenseConfig {
  enabled: boolean
  data: string
}

export interface AuthUser {
  username: string
  password: string
  permission: 'readwrite' | 'readonly' | 'writeonly'
}

export interface AuthConfig {
  enabled: boolean
  useBuiltIn: boolean
  users: AuthUser[]
}

export interface RemoteCompactionScheduler {
  image: ImageConfig
  replicas: number
}

export interface RemoteCompactionCompactor {
  image: ImageConfig
  replicas: number
}

export interface RemoteCompactionConfig {
  enabled: boolean
  scheduler: RemoteCompactionScheduler
  compactor: RemoteCompactionCompactor
}

export interface EnterpriseDashboardConfig {
  enabled: boolean
  image: ImageConfig
  replicas: number
}

export interface EnterpriseFeatures {
  license: LicenseConfig
  auth: AuthConfig
  remoteCompaction: RemoteCompactionConfig
  dashboard: EnterpriseDashboardConfig
  regionFailover: boolean
}

export interface MonitoringStandaloneResources {
  cpu: string
  memory: string
}

export interface MonitoringObjectStorageCache {
  enabled: boolean
  cacheCapacity: string
  storageClassName: string
  storageSize: string
}

export interface MonitoringObjectStorageConfig {
  type: 'none' | 's3' | 'gcs' | 'azblob' | 'oss'
  secretName: string
  s3: S3Config
  gcs: GcsConfig
  azblob: AzblobConfig
  oss: OssConfig
  cache: MonitoringObjectStorageCache
}

export interface MonitoringDatanodeStorageConfig {
  enabled: boolean
  storageClassName: string
  storageSize: string
  storageRetainPolicy: string
}

export interface MonitoringConfig {
  enabled: boolean
  resources: MonitoringStandaloneResources
  objectStorage: MonitoringObjectStorageConfig
  datanodeStorage: MonitoringDatanodeStorageConfig
}

export interface GrafanaConfig {
  enabled: boolean
  adminUser: string
  adminPassword: string
  persistenceEnabled: boolean
  persistenceSize: string
}

export interface JaegerConfig {
  enabled: boolean
}

export interface TracingConfig {
  enabled: boolean
  endpoint: string
  sampleRatio: string
}

export interface SlowQueryConfig {
  enabled: boolean
  threshold: string
  ttl: string
}

export interface PrometheusConfig {
  monitorEnabled: boolean
  ruleEnabled: boolean
}

export interface MonitoringObservability {
  monitoring: MonitoringConfig
  grafana: GrafanaConfig
  jaeger: JaegerConfig
  tracing: TracingConfig
  slowQuery: SlowQueryConfig
  prometheus: PrometheusConfig
}

export interface LoggingConfig {
  level: string
  format: string
}

export interface IngressRule {
  host: string
  path: string
}

export interface IngressConfig {
  enabled: boolean
  ingressClassName: string
  rules: IngressRule[]
}

export interface AppConfig {
  clusterName: string
  clusterNamespace: string
  image: ImageConfig
  customImageRegistry: CustomImageRegistry
  initializerImage: ImageConfig
  frontend: ComponentConfig
  meta: {
    replicas: number
    resources: Resources
    backendStorage: MetaBackendStorage
    configData: string
  }
  datanode: DatanodeConfig
  flownode: ComponentConfig
  objectStorage: ObjectStorageConfig
  wal: WalConfig
  enterprise: EnterpriseFeatures
  monitoringObservability: MonitoringObservability
  logging: LoggingConfig
  ingress: IngressConfig
}
