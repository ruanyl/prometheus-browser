import { Collector, Sample } from './Collector'

import { hashLabelMap } from './utils'

interface GaugeValue {
  value: number
  labelMap?: Record<string, string>
}

export class Gauge extends Collector {
  type = 'gauge' as const
  gaugeValueMap: Record<string, GaugeValue> = {}

  set(v: number, labelMap?: Record<string, string>) {
    if (!Number.isFinite(v)) {
      throw new Error(`Invalid Counter value: ${v}`)
    }

    const key = labelMap ? hashLabelMap(labelMap) : ''
    let gaugeValue: GaugeValue | undefined = this.gaugeValueMap[key]

    if (!gaugeValue) {
      gaugeValue = { value: v, labelMap }
      this.gaugeValueMap[key] = gaugeValue
    } else {
      gaugeValue.value = v
    }
  }

  inc(v: number = 1, labelMap?: Record<string, string>) {
    if (!Number.isFinite(v)) {
      throw new Error(`Invalid Counter value: ${v}`)
    }

    const key = labelMap ? hashLabelMap(labelMap) : ''
    let gaugeValue: GaugeValue | undefined = this.gaugeValueMap[key]

    if (!gaugeValue) {
      gaugeValue = { value: v, labelMap }
      this.gaugeValueMap[key] = gaugeValue
    } else {
      gaugeValue.value += v
    }
  }

  dec(v: number = 1, labelMap?: Record<string, string>) {
    if (!Number.isFinite(v)) {
      throw new Error(`Invalid Counter value: ${v}`)
    }

    const key = labelMap ? hashLabelMap(labelMap) : ''
    let gaugeValue: GaugeValue | undefined = this.gaugeValueMap[key]

    if (!gaugeValue) {
      gaugeValue = { value: -v, labelMap }
      this.gaugeValueMap[key] = gaugeValue
    } else {
      gaugeValue.value -= v
    }
  }

  setToCurrentTime(labelMap?: Record<string, string>) {
    this.set(Date.now() / 1000, labelMap)
  }

  reset() {
    this.gaugeValueMap = {}
  }

  collect() {
    const samples: Sample[] = []
    const counterValues = Object.values(this.gaugeValueMap)

    for (const counterValue of counterValues) {
      samples.push({
        value: counterValue.value,
        labels: counterValue.labelMap ?? {},
        name: this.name,
      })
    }

    return samples
  }
}
