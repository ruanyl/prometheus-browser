import { Counter, PushGateway, defaultRegistry } from '../'

const mockedFetch = jest.fn()
global.fetch = mockedFetch

const ENDPOINT = 'http://localhost/metrics'

const EXPECTED_PAYLOAD = `# HELP counter A counter
# TYPE counter counter
counter 1
`

describe('PushGateway', () => {
  beforeEach(() => {
    mockedFetch.mockReset()
  })

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
    await gateway.push({
      job: 'gateway',
    })
    expect(mockedFetch.mock.calls[0][0]).toBe(`${ENDPOINT}/job/gateway`)
    expect(mockedFetch.mock.calls[0][1].body).toBe(EXPECTED_PAYLOAD)
    expect(mockedFetch.mock.calls[0][1].method).toBe('POST')
  })

  it('should push metrics to endpoint with group', async () => {
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

  it('should push metrics to endpoint with `PUT` method', async () => {
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
})
