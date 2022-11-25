import { CollectorRegistry, defaultRegistry } from '../CollectorRegistry'

import { Counter } from '../Counter'
import { Histogram } from '../Histogram'

const EXPECTED_TEXT_SAMPLES_HISTOGRAM = `# HELP http_request_duration_seconds A histogram of the request duration
# TYPE http_request_duration_seconds histogram
http_request_duration_seconds_bucket{le="0.005"} 0
http_request_duration_seconds_bucket{le="0.01"} 0
http_request_duration_seconds_bucket{le="0.025"} 0
http_request_duration_seconds_bucket{le="0.05"} 0
http_request_duration_seconds_bucket{le="0.075"} 0
http_request_duration_seconds_bucket{le="0.1"} 0
http_request_duration_seconds_bucket{le="0.25"} 1
http_request_duration_seconds_bucket{le="0.5"} 1
http_request_duration_seconds_bucket{le="0.75"} 1
http_request_duration_seconds_bucket{le="1"} 2
http_request_duration_seconds_bucket{le="2.5"} 2
http_request_duration_seconds_bucket{le="5"} 3
http_request_duration_seconds_bucket{le="7.5"} 3
http_request_duration_seconds_bucket{le="10"} 3
http_request_duration_seconds_bucket{le="+Inf"} 4
http_request_duration_seconds_sum 17.23
http_request_duration_seconds_count 4
`

const EXPECTED_TEXT_SAMPLES_COUNTER = `# HELP http_request_counter A counter of the total number of requests
# TYPE http_request_counter counter
http_request_counter 1
`

const EXPECTED_TEXT_SAMPLES_COUNTER_LABELS = `# HELP http_request_counter A counter of the total number of requests
# TYPE http_request_counter counter
http_request_counter{code="200"} 2
`

const EXPECTED_TEXT_SAMPLES_COUNTER_DEFAULT_LABELS = `# HELP http_request_counter A counter of the total number of requests
# TYPE http_request_counter counter
http_request_counter{environment="production",code="200"} 2
`

describe('Histogram', () => {
  const registry = new CollectorRegistry()
  beforeEach(() => {
    registry.reset()
  })

  it('should have default registry', () => {
    const histogram = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'A histogram of the request duration',
    })

    expect(defaultRegistry.collectors['http_request_duration_seconds']).toEqual(
      histogram
    )
  })

  it(' should have collector registered to custom registry', () => {
    const histogram = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'A histogram of the request duration',
      registry,
    })

    expect(registry.collectors['http_request_duration_seconds']).toEqual(
      histogram
    )
  })

  it('should unregister collector from the registry', () => {
    new Histogram({
      name: 'http_request_duration_seconds',
      help: 'A histogram of the request duration',
      registry,
    })
    registry.unregister('http_request_duration_seconds')
    expect(registry.collectors['http_request_duration_seconds']).toBeUndefined()
  })

  it('should expose text format samples for histogram', () => {
    const histogram = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'A histogram of the request duration',
      registry,
    })

    histogram.observe(0.23)
    histogram.observe(1)
    histogram.observe(5)
    histogram.observe(11)

    const text = registry.expose()
    expect(text).toEqual(EXPECTED_TEXT_SAMPLES_HISTOGRAM)
  })

  it('should expose text format samples for counter', () => {
    const counter = new Counter({
      name: 'http_request_counter',
      help: 'A counter of the total number of requests',
      registry,
    })

    counter.inc()

    const text = registry.expose()
    expect(text).toEqual(EXPECTED_TEXT_SAMPLES_COUNTER)
  })

  it('should expose text format samples for counter with labels', () => {
    const counter = new Counter({
      name: 'http_request_counter',
      help: 'A counter of the total number of requests',
      registry,
    })

    counter.inc(2, { code: '200' })

    const text = registry.expose()
    expect(text).toEqual(EXPECTED_TEXT_SAMPLES_COUNTER_LABELS)
  })

  it('should expose text format samples for counter with labels and default labels', () => {
    registry.setDefaultLabels({ environment: 'production' })

    const counter = new Counter({
      name: 'http_request_counter',
      help: 'A counter of the total number of requests',
      registry,
    })

    counter.inc(2, { code: '200' })

    const text = registry.expose()
    expect(text).toEqual(EXPECTED_TEXT_SAMPLES_COUNTER_DEFAULT_LABELS)
  })

  it('should expose empty text when no samples', () => {
    new Histogram({
      name: 'http_request_duration_seconds',
      help: 'A histogram of the request duration',
      registry,
    })

    const text = registry.expose()
    expect(text).toEqual('')
  })
})
