import { Collector, Sample } from './Collector'
import { hashLabelMap } from './utils'

interface CounterValue {
  value: number
  labelMap?: Record<string, string>
}

export class Counter extends Collector {
  type = 'counter' as const
  counterValueMap: Record<string, CounterValue> = {}

  inc(v: number = 1, labelMap?: Record<string, string>) {
    if (!Number.isFinite(v)) {
      throw new Error(`Invalid Counter value: ${v}`)
    }

    const key = labelMap ? hashLabelMap(labelMap) : ''
    let counterValue: CounterValue | undefined = this.counterValueMap[key]

    if (!counterValue) {
      counterValue = { value: v, labelMap }
      this.counterValueMap[key] = counterValue
    } else {
      counterValue.value += v
    }
  }

  reset() {
    this.counterValueMap = {}
  }

  collect() {
    const samples: Sample[] = []
    const counterValues = Object.values(this.counterValueMap)

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
