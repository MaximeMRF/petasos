import { HermesClient } from "@pythnetwork/hermes-client"
import type { PriceUpdate } from "@pythnetwork/hermes-client"

interface PetasosOptions {
  url?: string;
  priceIds: string[]
  maxReconnectAttempts?: number
  parsed?: boolean
}

export class Petasos {
  #options: PetasosOptions
  #eventSource: EventSource | undefined
  #reconnectAttempts: number = 0
  #client: HermesClient
  #priceUpdateHandler: ((data: PriceUpdate) => void) | undefined

  constructor(options: PetasosOptions) {
    this.#options = options
    const url = this.#options.url || "https://hermes.pyth.network"
    this.#client = new HermesClient(url, {})
  }

  async #connect() {
    if (!this.#client) {
      throw new Error("HermesClient is not initialized")
    }

    this.#eventSource = await this.#client.getPriceUpdatesStream(this.#options.priceIds, {
      parsed: this.#options.parsed || false,
      allowUnordered: false,
    })

    this.#eventSource.addEventListener('message', this.#onMessage.bind(this))
    this.#eventSource.addEventListener('error', this.#onError.bind(this))
  }

  #onMessage(event: MessageEvent) {
    const data = JSON.parse(event.data)

    if (this.#priceUpdateHandler) {
      try {
        this.#priceUpdateHandler(data)
      } catch (error) {
        console.error(error)
      }
    }
  }

  #onError() {
    this.#reconnect()
  }

  #reconnect() {
    if (this.#reconnectAttempts < (this.#options.maxReconnectAttempts || 5)) {
      this.#reconnectAttempts++
      console.log(`Reconnecting... (${this.#reconnectAttempts})`)
      this.#connect()
    } else {
      this.#eventSource?.close()
      throw new Error("Max reconnect attempts reached")
    }
  }

  getClient() {
    return this.#client
  }

  getPriceUpdates(handler: (data: PriceUpdate) => void) {
    this.#priceUpdateHandler = handler
  }

  async listen() {
    await this.#connect()
  }
}
