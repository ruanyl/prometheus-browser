import { CollectorRegistry, defaultRegistry } from './CollectorRegistry'

interface PushGatewayConfig {
  url: string
  registry?: CollectorRegistry
}

interface PushOptions {
  job?: string
  group?: [string, string][]
  fetchOptions?: RequestInit
}

export class PushGateway {
  registry = defaultRegistry
  url: string

  constructor(config: PushGatewayConfig) {
    if (config.registry) {
      this.registry = config.registry
    }

    this.url = config.url
  }

  async push(options: PushOptions = {}) {
    let jobPath = ''
    let groupPath = ''

    if (options.job) {
      jobPath = `/job/${options.job}`
    }

    if (options.group) {
      options.group.forEach(([key, value]) => {
        groupPath += `/${key}/${value}`
      })
    }

    const endpoint = `${this.url}${jobPath}${groupPath}`
    const textPayload = this.registry.expose()

    const method = options.fetchOptions?.method
      ? options.fetchOptions.method
      : 'POST'

    if (textPayload) {
      return fetch(endpoint, {
        ...options.fetchOptions,
        method,
        headers: {
          'Content-Type': 'text/plain; version=0.0.4',
          ...options.fetchOptions?.headers,
        },
        body: textPayload,
      })
    }
  }
}
