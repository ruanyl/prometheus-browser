import { Histogram } from './Histogram'

interface TimerConfig {
  histogram: Histogram
  start?: number
  labelMap?: Record<string, string>
}

export class Timer {
  start: number = Date.now()
  histogram: Histogram
  labelMap: Record<string, string> = {}

  constructor(config: TimerConfig) {
    if (config.start) {
      this.start = config.start
    }

    if (config.labelMap) {
      this.labelMap = config.labelMap
    }

    this.histogram = config.histogram
  }

  observeDuration() {
    const end = Date.now()
    const diff = end - this.start
    this.histogram.observe(diff / 1000, this.labelMap)
  }
}
