# GreptimeDB Enterprise Values Configurator

[![Build](https://github.com/v0y4g3r/enterprise-values-configurator/actions/workflows/build.yml/badge.svg)](https://github.com/v0y4g3r/enterprise-values-configurator/actions/workflows/build.yml)

A web-based step-by-step wizard that guides you through configuring a GreptimeDB enterprise deployment and generates a `values.yaml` file for the [greptimedb-cluster](../greptime-helm-charts/charts/greptimedb-cluster) Helm chart.

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

## Build for Production

```bash
npm run build
npm run preview
```

The production build is output to `dist/`.

## What It Does

The configurator walks you through 8 steps to configure your GreptimeDB cluster:

| Step | What You Configure |
|---|---|
| **Cluster Basics** | Cluster name, GreptimeDB image tag, custom image registry, initializer image |
| **Components** | Enable/disable Frontend, Datanode, Flownode; set replicas, resource presets, datanode storage class and size |
| **Meta Backend** | Metadata store: etcd (default), MySQL, or PostgreSQL with connection details and credentials |
| **Object Storage** | Data storage: AWS S3, GCS, Azure Blob, Alibaba OSS, or local filesystem; credentials and write cache |
| **WAL Configuration** | Local WAL (raft-engine) or remote WAL (Apache Kafka); dedicated WAL volume |
| **Enterprise Features** | License, authentication with user management, remote compaction, enterprise dashboard, region failover |
| **Monitoring** | Monitoring standalone, Grafana, Jaeger, OpenTelemetry tracing, slow query logging, Prometheus integration |
| **Review & Generate** | Summary of selections, YAML preview, download or copy to clipboard |

## Output

The generated `values.yaml` is compatible with the `greptimedb-cluster` Helm chart:

```bash
helm install greptimedb greptime/greptimedb-cluster \
  -f values.yaml \
  --set-file license.data=./license.txt
```

## Tech Stack

- [Vue 3](https://vuejs.org/) with Composition API
- [Vite](https://vitejs.dev/) for dev server and bundling
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [js-yaml](https://github.com/nodeca/js-yaml) for YAML generation

## Project Structure

```
src/
├── main.ts                          # App entry point
├── App.vue                          # Root component
├── types/config.ts                  # TypeScript interfaces
├── store/config.ts                  # Reactive state with defaults
├── generator/valuesYaml.ts          # Config → values.yaml conversion
├── components/
│   ├── WizardShell.vue              # Step navigation and progress
│   ├── StepNav.vue                  # Back/Next buttons
│   ├── steps/                       # 8 wizard step components
│   │   ├── ClusterBasics.vue
│   │   ├── Components.vue
│   │   ├── MetaBackend.vue
│   │   ├── ObjectStorage.vue
│   │   ├── WalConfig.vue
│   │   ├── EnterpriseFeatures.vue
│   │   ├── Monitoring.vue
│   │   └── ReviewGenerate.vue
│   └── ui/                          # Reusable form widgets
│       ├── ToggleSwitch.vue
│       ├── RadioGroup.vue
│       ├── FormField.vue
│       └── CodePreview.vue
└── style.css                        # Tailwind directives
```
