import { CollectorRegistry, defaultRegistry } from './CollectorRegistry'

interface PushGatewayConfig {
  url: string
  registry?: CollectorRegistry
  fetchOptions?: RequestInit
}

interface PushOptions {
  job?: string
  group?: [string, string][]
  fetchOptions?: RequestInit
}

const defaultFetchOptions: RequestInit = {
  method: 'POST',
}

export class PushGateway {
  registry = defaultRegistry
  fetchOptions = defaultFetchOptions
  url: string

  constructor(config: PushGatewayConfig) {
    if (config.registry) {
      this.registry = config.registry
    }

    if (config.fetchOptions) {
      this.fetchOptions = { ...this.fetchOptions, ...config.fetchOptions }
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

    const method = options.fetchOptions?.method || this.fetchOptions.method

    if (textPayload) {
      return fetch(endpoint, {
        ...this.fetchOptions,
        ...options.fetchOptions,
        method,
        headers: {
          'Content-Type': 'text/plain; version=0.0.4',
          ...this.fetchOptions.headers,
          ...options.fetchOptions?.headers,
        },
        body: textPayload,
      })
    }
  }
}
