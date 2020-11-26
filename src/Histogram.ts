import { Collector, CollectorConfig, Sample } from './Collector'

import { hashLabelMap } from './utils'

interface HistogramConfig extends CollectorConfig {
  buckets?: number[]
}

interface BucketValue {
  labelMap: Record<string, string>
  bucketMap: Record<string, number>
  sum: number
  count: number
}

export class Histogram extends Collector {
  buckets: number[] = [
    0.005,
    0.01,
    0.025,
    0.05,
    0.075,
    0.1,
    0.25,
    0.5,
    0.75,
    1,
    2.5,
    5,
    7.5,
    10,
  ]
  bucketValueMap: Record<string, BucketValue>

  constructor(config: HistogramConfig) {
    super(config)

    if (config.labels) {
      for (const label of config.labels) {
        if (label === 'le') {
          throw new Error('Invalid label name: `le`')
        }
      }
    }

    if (config.buckets) {
      this.buckets = config.buckets
    }
  }

  createInitialBucketMap() {
    const bucketMap: Record<string, number> = {}
    for (const b of this.buckets) {
      bucketMap[`${b}`] = 0
    }
    return bucketMap
  }

  createInitialBucketValue(): BucketValue {
    return {
      labelMap: {},
      bucketMap: this.createInitialBucketMap(),
      sum: 0,
      count: 0,
    }
  }

  getBucketByValue(v: number) {
    for (const bucket of this.buckets) {
      if (v <= bucket) {
        return bucket
      }
    }
    return -1
  }

  validateLabels(labels: string[]) {
    for (const label of labels) {
      if (!this.labels.includes(label)) {
        throw new Error(`Invalid label: ${label}`)
      }
    }
  }

  observe(v: number, labelMap?: Record<string, string>) {
    if (labelMap) {
      this.validateLabels(Object.keys(labelMap))
    }

    if (!Number.isFinite(v)) {
      throw new Error(`Invalid Histogram value: ${v}`)
    }

    const key = labelMap ? hashLabelMap(labelMap) : ''
    let bucketValue: BucketValue | undefined = this.bucketValueMap[key]

    if (!bucketValue) {
      bucketValue = this.createInitialBucketValue()
      this.bucketValueMap[key] = bucketValue
    }

    bucketValue.sum = bucketValue.sum + v
    bucketValue.count = bucketValue.count + 1

    if (labelMap) {
      bucketValue.labelMap = labelMap
    }

    const targetBucket = this.getBucketByValue(v)

    if (Number.isFinite(bucketValue.bucketMap[targetBucket])) {
      bucketValue.bucketMap[targetBucket] += 1
    }
  }

  collect() {
    const samples: Sample[] = []
    const bucketValues = Object.values(this.bucketValueMap)

    for (const bucketValue of bucketValues) {
      let total = 0
      for (const bucket of this.buckets) {
        total += bucketValue.bucketMap[bucket]

        samples.push({
          labels: { ...bucketValue.labelMap, le: `${bucket}` },
          value: total,
          name: `${this.name}_bucket`,
        })
      }

      samples.push(
        ...[
          {
            labels: { ...bucketValue.labelMap, le: '+Inf' },
            value: total,
            name: `${this.name}_bucket`,
          },
          {
            labels: bucketValue.labelMap,
            value: bucketValue.sum,
            name: `${this.name}_sum`,
          },
          {
            labels: bucketValue.labelMap,
            value: bucketValue.count,
            name: `${this.name}_count`,
          },
        ]
      )
    }

    return samples
  }
}
