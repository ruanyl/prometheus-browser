import * as uuid from 'uuid'

import { CollectorRegistry, defaultRegistry } from './CollectorRegistry'

interface PushGatewayConfig {
  url: string
  registry?: CollectorRegistry
}

interface PushOptions {
  job: string
  instance?: string
  fetchOptions?: RequestInit
}

export class PushGateway {
  instance: string = uuid.v4()
  registry = defaultRegistry
  url: string

  constructor(config: PushGatewayConfig) {
    if (config.registry) {
      this.registry = config.registry
    }

    this.url = config.url
  }

  async push(options: PushOptions) {
    const endpoint = `${this.url}/job/${options.job}/instance/${
      options.instance || this.instance
    }`
    const textPayload = this.registry.expose()
    if (textPayload) {
      return fetch(endpoint, {
        ...options.fetchOptions,
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain; version=0.0.4',
          ...options.fetchOptions?.headers,
        },
        body: textPayload,
      })
    }
  }
}
