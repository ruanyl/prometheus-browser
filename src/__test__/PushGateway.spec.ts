import { Counter, PushGateway, defaultRegistry } from '../'

const mockedFetch = jest.fn()
window.fetch = mockedFetch

const ENDPOINT = 'http://localhost/metrics'

const EXPECTED_PAYLOAD = `# HELP counter A counter
# TYPE counter counter
counter 1
`

describe('PushGateway', () => {
  beforeEach(() => {
    mockedFetch.mockReset()
    defaultRegistry.reset()
  })

  it('should push metrics to default endpoint', async () => {
    const counter = new Counter({
      name: 'counter',
      help: 'A counter',
    })
    counter.inc()

    const gateway = new PushGateway({ url: ENDPOINT })
    await gateway.push()
    expect(mockedFetch.mock.calls[0][0]).toBe(ENDPOINT)
    expect(mockedFetch.mock.calls[0][1].body).toBe(EXPECTED_PAYLOAD)
    expect(mockedFetch.mock.calls[0][1].method).toBe('POST')
  })

  it('should push metrics to endpoint with job and group', async () => {
    const counter = new Counter({
      name: 'counter',
      help: 'A counter',
    })
    counter.inc()

    const gateway = new PushGateway({ url: ENDPOINT })
    await gateway.push({
      job: 'gateway',
      group: [['foo', 'bar']],
    })
    expect(mockedFetch.mock.calls[0][0]).toBe(`${ENDPOINT}/job/gateway/foo/bar`)
    expect(mockedFetch.mock.calls[0][1].body).toBe(EXPECTED_PAYLOAD)
    expect(mockedFetch.mock.calls[0][1].method).toBe('POST')
  })

  it('should push metrics to endpoint with `PUT` method from push options', async () => {
    const counter = new Counter({
      name: 'counter',
      help: 'A counter',
    })
    counter.inc()

    const gateway = new PushGateway({ url: ENDPOINT })
    await gateway.push({
      job: 'gateway',
      group: [['foo', 'bar']],
      fetchOptions: {
        method: 'PUT',
      },
    })
    expect(mockedFetch.mock.calls[0][0]).toBe(`${ENDPOINT}/job/gateway/foo/bar`)
    expect(mockedFetch.mock.calls[0][1].body).toBe(EXPECTED_PAYLOAD)
    expect(mockedFetch.mock.calls[0][1].method).toBe('PUT')
  })

  it('should push metrics to endpoint with `PUT` method from gateway config', async () => {
    const counter = new Counter({
      name: 'counter',
      help: 'A counter',
    })
    counter.inc()

    const gateway = new PushGateway({
      url: ENDPOINT,
      fetchOptions: {
        method: 'PUT',
      },
    })
    await gateway.push({
      job: 'gateway',
      group: [['foo', 'bar']],
    })
    expect(mockedFetch.mock.calls[0][0]).toBe(`${ENDPOINT}/job/gateway/foo/bar`)
    expect(mockedFetch.mock.calls[0][1].body).toBe(EXPECTED_PAYLOAD)
    expect(mockedFetch.mock.calls[0][1].method).toBe('PUT')
  })
})
