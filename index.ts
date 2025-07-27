import { HermesClient } from "@pythnetwork/hermes-client"
import type { PriceUpdate } from "@pythnetwork/hermes-client"
import { PAIRS } from "./feeds_type.js"

type Pair = keyof typeof PAIRS
type PairId = typeof PAIRS[Pair]

const ID_TO_PAIR = Object.fromEntries(
  Object.entries(PAIRS).map(([k, v]) => [v, k])
) as Record<PairId, Pair>

function getPairId(pair: Pair): PairId {
  return PAIRS[pair]
}

function getPair(priceId: PairId): Pair {
  const pair = ID_TO_PAIR[priceId]
  if (!pair) throw new Error(`Unknown priceId: ${priceId}`)
  return pair
}

interface PetasosOptions {
  url?: string
  pairs: Pair[]
  maxReconnectAttempts?: number
  autoParse?: boolean
}

export class Petasos {
  #options: PetasosOptions
  #eventSource: EventSource | undefined
  #reconnectAttempts: number = 0
  #client: HermesClient
  #priceUpdateHandler: ((data: PriceUpdate | Record<Pair, PairId>) => void) | undefined

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
      parsed: true,
      allowUnordered: false,
    })

    this.#eventSource.addEventListener('message', this.#onMessage.bind(this))
    this.#eventSource.addEventListener('error', this.#onError.bind(this))
  }

  #parseData(data: PriceUpdate) {
    const prices: Record<string, number> = {}

    if (!data.parsed) {
      throw new Error("Property 'parsed' doesn't exist on the object data when using autoParse")
    }

    for (const feed of data.parsed) {
      const pair = getPair(feed.id as PairId)
      const rawPrice = Number(feed.price.price)
      const expo = feed.price.expo
      const price = rawPrice * 10 ** expo
      prices[pair] = price
    }
    return prices
  }

  #onMessage(event: MessageEvent) {
    let data = JSON.parse(event.data)

    if (this.#options.autoParse) {
      data = this.#parseData(data)
    }

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

  getPriceUpdates(handler: (data: PriceUpdate | Record<Pair, PairId>) => void) {
    this.#priceUpdateHandler = handler
  }

  async listen() {
    await this.#connect()
  }
}
