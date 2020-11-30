import { defaultBuckets, defaultRegistry, Histogram } from '../'

describe('Histogram', () => {
  beforeEach(() => {
    defaultRegistry.reset()
  })

  it('Histogram should have default buckets', () => {
    const histogram = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'A histogram of the request duration',
    })
    expect(histogram.buckets).toEqual(defaultBuckets)
  })

  it('Histogram should have new buckets', () => {
    const buckets = [0.1, 0.2, 0.5, 1, 5, 10]
    const histogram = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'A histogram of the request duration',
      buckets,
    })
    expect(histogram.buckets).toEqual(buckets)
  })

  it('Histogram should observe value', () => {
    const histogram = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'A histogram of the request duration',
    })
    const value = 0.23

    histogram.observe(value)
    const samples1 = histogram.collect()

    defaultBuckets.forEach((bucket, i) => {
      if (bucket < value) {
        expect(samples1[i].value).toBe(0)
      } else {
        expect(samples1[i].value).toBe(1)
      }
    })

    histogram.observe(value)
    const samples2 = histogram.collect()

    defaultBuckets.forEach((bucket, i) => {
      if (bucket < value) {
        expect(samples2[i].value).toBe(0)
      } else {
        expect(samples2[i].value).toBe(2)
      }
    })
  })

  it('Histogram MUST have count equals to +Inf', () => {
    const histogram = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'A histogram of the request duration',
    })
    histogram.observe(0.2)
    histogram.observe(0.3)
    histogram.observe(0.4)

    const samples = histogram.collect()
    const countSample = samples.find(
      (sample) => sample.name === 'http_request_duration_seconds_count'
    )
    const infSample = samples.find((sample) => sample.labels['le'] === '+Inf')
    expect(countSample?.value).toEqual(3)
    expect(countSample?.value).toEqual(infSample?.value)
  })

  it('Histogram MUST have sum correctly set', () => {
    const histogram = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'A histogram of the request duration',
    })
    histogram.observe(0.2)
    histogram.observe(0.3)
    histogram.observe(0.4)

    const samples = histogram.collect()
    const sumSample = samples.find(
      (sample) => sample.name === 'http_request_duration_seconds_sum'
    )
    expect(sumSample?.value).toEqual(0.9)
  })

  it('should observe duration', async () => {
    const histogram = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'A histogram of the request duration',
    })

    const timer = histogram.startTimer()
    await new Promise((resolve) => {
      setTimeout(() => {
        timer.observeDuration()

        const samples = histogram.collect()
        const sumSample = samples.find(
          (sample) => sample.name === 'http_request_duration_seconds_sum'
        )
        const countSample = samples.find(
          (sample) => sample.name === 'http_request_duration_seconds_count'
        )
        expect(countSample?.value).toBe(1)
        expect(sumSample?.value).toBeGreaterThan(0.5)
        resolve(samples)
      }, 500)
    })
  })
})
