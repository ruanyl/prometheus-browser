import { CollectorRegistry, defaultRegistry } from './CollectorRegistry'
import { isValidCollectorName, isValidLabels } from './utils'

export interface CollectorConfig {
  name: string
  help: string
  labels?: string[]
  registry?: CollectorRegistry
}

export interface Sample {
  labels: Record<string, string>
  value: number
  name: string
}

export class Collector {
  registry: CollectorRegistry = defaultRegistry
  labels: string[] = []
  name: string
  help: string
  type: 'counter' | 'histogram' | 'summary' | 'gauge'

  constructor(config: CollectorConfig) {
    if (config.registry) {
      this.registry = config.registry
    }

    if (isValidCollectorName(config.name)) {
      this.name = config.name
    } else {
      throw new Error(
        'Collector name is invalid, it MUST follow regex /[a-zA-Z_:][a-zA-Z0-9_:]*/'
      )
    }

    if (config.labels) {
      if (isValidLabels(config.labels)) {
        this.labels = config.labels
      } else {
        throw new Error(
          'Labels may contain invalid name, it MUST follow regex /[a-zA-Z_][a-zA-Z0-9_]*/'
        )
      }
    }

    this.help = config.help

    if (config.registry) {
      this.registry = config.registry
    }

    this.registry.register(this)
  }

  collect(): Sample[] {
    // to be implemented
    return []
  }

  reset() {
    // to be implemented
  }
}
