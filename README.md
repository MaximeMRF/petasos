# @maximemrf/petasos

A modern and experimental client for the [Pyth Network Hermes service](https://www.pyth.network/).

## Disclaimer

This library is experimental and may change in the future. Use at your own risk.
Don't hesitate to open an issue if you find a bug or have a feature request.

## Features

- Handles SSE (Server-Sent Events) to focus on product creation and not on connection management
- Simple API for subscribing to price updates

## Installation

```bash
npm install @maximemrf/petasos
```

## Example

```ts
import { Petasos } from "@maximemrf/petasos"

const priceIds = [
  // Find price IDs at https://pyth.network/developers/price-feed-ids
  "0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43", // BTC/USD
  "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace", // ETH/USD
]

const petasos = new Petasos({
  priceIds,
  maxReconnectAttempts: 5,
  parsed: true,
})

petasos.getPriceUpdates((data) => {
  console.log("Received price update:")
  if (!data?.parsed) {
    console.error("No parsed data available")
    return
  }
  for (const feed of data.parsed) {
    const rawPrice = Number(feed.price.price)
    const expo = feed.price.expo
    const readablePrice = rawPrice * 10 ** expo
    console.log(`price: ${readablePrice} USD`)
  }
})

await petasos.listen()

// Optionally, you can use the Hermes client directly to use methods requiring no subscription
const feeds = await petasos.getClient().getPriceFeeds()
```

## API

### `Petasos(options: PetasosOptions)`

- `url?`: string – Hermes service URL (default: `https://hermes.pyth.network`)
- `priceIds`: string[] – List of price IDs to subscribe to (list can be found at [Pyth Network Price Feed IDs](https://www.pyth.network/price-feeds))
- `maxReconnectAttempts?`: number – Maximum reconnect attempts (default: 5)
- `parsed?`: boolean – Whether to parse updates

### Methods

- `getClient()`: Returns the underlying `HermesClient` instance.
- `getPriceUpdates(handler)`: Registers a callback for price updates.
- `listen()`: Starts listening for price updates.

## License

MIT
