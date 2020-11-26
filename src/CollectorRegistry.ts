import { Collector } from './Collector'

export class CollectorRegistry {
  collectors: Record<string, Collector> = {}

  constructor() {}

  register(collector: Collector) {
    if (this.collectors[collector.name]) {
      throw new Error(`Collector already registered: ${collector.name}`)
    }

    this.collectors[collector.name] = collector
  }

  unregister(name: string) {
    if (this.collectors[name]) {
      delete this.collectors[name]
    }
  }
}

export const defaultRegistry = new CollectorRegistry()
