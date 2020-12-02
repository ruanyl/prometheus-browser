## prometheus-browser ![workflow](https://github.com/ruanyl/prometheus-browser/workflows/Build%20&%20Test/badge.svg)

Prometheus client implementation for browser to interact with push gateway

#### Counter
```typescript
import {Counter} from 'prometheus-browser'

const counter = new Counter({
  name: 'http_request_counter',
  help: 'A counter of the total number of requests',
  labels: ['status']
})
// increase by 1
counter.inc()

// increase by value
counter.inc(2)

// with label
counter.inc(2, {status: '200'})
```

#### Gauge
```typescript
import {Gauge} from 'prometheus-browser'

const gauge = new Gauge({
  name: 'memory_usage',
  help: 'A gauge of the memory usage',
  labels: ['foo']
})
// increase by 1
gauge.inc()

// increase by value
gauge.inc(2)

// decrease by 1
gauge.dec()

// decrease by value
gauge.dec(2)

// set a value
gauge.set(0)

// with label
gauge.inc(2, {foo: 'bar'})
```

#### Histogram
```typescript
import {Histogram} from 'prometheus-browser'

const histogram = new Histogram({
  name: 'http_request_duration',
  help: 'HTTP request duration',
  labels: ['foo']
})
// observe value
histogram.observe(0.5)
histogram.observe(2)

// with custom buckets
const histogram = new Histogram({
  name: 'http_request_duration',
  help: 'HTTP request duration',
  labels: ['foo'],
  buckets: [0.5, 1, 2, 5, 10]
})

// use a timer
const timer = histogram.startTimer()
// observe a timer
timer.observeDuration()
```

## With Push Gateway
```typescript
import {PushGateway} from 'prometheus-browser'

const gateway = new PushGateway({url: 'http://localhost:8080/metrics'})
// push metrics
// by default metrics are sent with "POST" request: https://github.com/prometheus/pushgateway#post-method
await gateway.push({job: 'pushgateway'})

// push to a group, the group is arrya of tuple: [string, string]
await gateway.push({job: 'pushgateway', group: [['client', 'foo']]})

//if you need "PUT" method: https://github.com/prometheus/pushgateway#put-method
await gateway.push({job: 'pushgateway', group: [['client', 'foo']], fetchOptions: {method: 'PUT'}})
```
