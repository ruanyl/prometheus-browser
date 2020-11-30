import { Collector } from './Collector'
import { convertSamplesToText } from './utils'

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

  /**
   * Expose samples as text format
   * https://prometheus.io/docs/instrumenting/exposition_formats/#text-format-details
   */
  expose() {
    const collectors = Object.values(this.collectors)
    const results = []

    for (const collector of collectors) {
      const samples = collector.collect()
      if (samples.length > 0) {
        const help = `# HELP ${collector.name} ${collector.help}\n`
        const type = `# TYPE ${collector.name} ${collector.type}\n`
        results.push(help, type)
        results.push(...convertSamplesToText(samples))
      }
    }
    return results.join('')
  }

  reset() {
    this.collectors = {}
  }
}

export const defaultRegistry = new CollectorRegistry()
