import { HermesClient } from "@pythnetwork/hermes-client"
import type { PriceUpdate } from "@pythnetwork/hermes-client"
import { PAIRS } from "./feeds_type.js"

type Pair = keyof typeof PAIRS
type PairId = typeof PAIRS[Pair]

function getPairId(pair: Pair): PairId {
  return PAIRS[pair]
}

interface PetasosOptions {
  url?: string
  pairs: Pair[]
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
    if (typeof options.maxReconnectAttempts === 'undefined') {
      options.maxReconnectAttempts = 5
    }
    const url = options.url ?? "https://hermes.pyth.network"
    this.#options = options
    this.#client = new HermesClient(url, {})
  }

  async #connect() {
    if (!this.#client) {
      throw new Error("HermesClient is not initialized")
    }

    const priceIds = this.#options.pairs.map(getPairId)

    this.#eventSource = await this.#client.getPriceUpdatesStream(priceIds, {
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
    if (
      this.#options.maxReconnectAttempts
      && this.#reconnectAttempts < this.#options.maxReconnectAttempts
    ) {
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
