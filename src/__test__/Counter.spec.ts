import { Counter, defaultRegistry } from '../'

describe('Histogram', () => {
  beforeEach(() => {
    defaultRegistry.reset()
  })

  it('should increase counter by 1', () => {
    const counter = new Counter({
      name: 'appsearch_request_counter',
      help: 'A counter of the total number of app-search requests',
    })
    counter.inc()
    const samples = counter.collect()
    expect(samples).toHaveLength(1)
    const sample = samples[0]
    expect(sample.value).toBe(1)
  })

  it('should increase counter by the specified value', () => {
    const counter = new Counter({
      name: 'appsearch_request_counter',
      help: 'A counter of the total number of app-search requests',
    })
    counter.inc(2)

    const samples = counter.collect()
    expect(samples).toHaveLength(1)
    const sample = samples[0]
    expect(sample.value).toBe(2)
  })

  it('should increase counter multiple times', () => {
    const counter = new Counter({
      name: 'appsearch_request_counter',
      help: 'A counter of the total number of app-search requests',
    })
    counter.inc()
    counter.inc()
    counter.inc(2)

    const samples = counter.collect()
    expect(samples).toHaveLength(1)
    const sample = samples[0]
    expect(sample.value).toBe(4)
  })
})
