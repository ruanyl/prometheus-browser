import { Collector } from './Collector'
import { convertSamplesToText } from './utils'

export class CollectorRegistry {
  collectors: Record<string, Collector> = {}
  defaultLabelMap: Record<string, string> = {}

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

  setDefaultLabels(labelMap: Record<string, string>) {
    this.defaultLabelMap = labelMap
  }

  /**
   * Expose samples as text format
   * https://prometheus.io/docs/instrumenting/exposition_formats/#text-format-details
   */
  expose() {
    const collectors = Object.values(this.collectors)
    const defaultLabelNames = Object.keys(this.defaultLabelMap);
    const results = []

    for (const collector of collectors) {
      const samples = collector.collect()
      if (samples.length > 0) {
        const help = `# HELP ${collector.name} ${collector.help}\n`
        const type = `# TYPE ${collector.name} ${collector.type}\n`

        for (const sample of samples) {
          sample.labels = sample.labels || {}

          if (defaultLabelNames.length > 0) {
            // Make a copy before mutating
            sample.labels = { ...sample.labels }

            for (const labelName of defaultLabelNames) {
              sample.labels[labelName] = sample.labels[labelName] || this.defaultLabelMap[labelName]
            }
          }
        }

        results.push(help, type)
        results.push(...convertSamplesToText(samples))
      }
    }
    return results.join('')
  }

  reset() {
    this.collectors = {}
    this.defaultLabelMap = {}
  }
}

export const defaultRegistry = new CollectorRegistry()
