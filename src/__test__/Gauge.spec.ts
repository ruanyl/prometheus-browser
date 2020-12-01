import { Gauge, defaultRegistry } from '../'

describe('Gauge', () => {
  beforeEach(() => {
    defaultRegistry.reset()
  })

  it('should set gauge with the specified value', () => {
    const gauge = new Gauge({
      name: 'memory_usage',
      help: 'A gauge of the memory usage',
    })
    gauge.set(10)
    const samples = gauge.collect()
    expect(samples).toHaveLength(1)
    const sample = samples[0]
    expect(sample.value).toBe(10)
  })

  it('should increase by 1', () => {
    const gauge = new Gauge({
      name: 'memory_usage',
      help: 'A gauge of the memory usage',
    })
    gauge.inc()
    const samples = gauge.collect()
    expect(samples).toHaveLength(1)
    const sample = samples[0]
    expect(sample.value).toBe(1)
  })

  it('should increase by the specified value', () => {
    const gauge = new Gauge({
      name: 'memory_usage',
      help: 'A gauge of the memory usage',
    })
    gauge.inc(2)

    const samples = gauge.collect()
    expect(samples).toHaveLength(1)
    const sample = samples[0]
    expect(sample.value).toBe(2)
  })

  it('should decrease by 1', () => {
    const gauge = new Gauge({
      name: 'memory_usage',
      help: 'A gauge of the memory usage',
    })
    gauge.set(10)
    gauge.dec()

    const samples = gauge.collect()
    expect(samples).toHaveLength(1)
    const sample = samples[0]
    expect(sample.value).toBe(9)
  })

  it('should decrease by specified value', () => {
    const gauge = new Gauge({
      name: 'memory_usage',
      help: 'A gauge of the memory usage',
    })
    gauge.set(10)
    gauge.dec(10)

    const samples = gauge.collect()
    expect(samples).toHaveLength(1)
    const sample = samples[0]
    expect(sample.value).toBe(0)
  })
})
