# @maximemrf/petasos

A modern, powerful and experimental client for the [Pyth Network Hermes service](https://www.pyth.network/).

## Disclaimer

This library is experimental and may change in the future. Use at your own risk.
Don't hesitate to open an issue if you find a bug or have a feature request.

## Features

- Subscribe to crypto feeds using human-readable trading pairs with IDE autocompletion instead of raw price IDs
- Handles SSE (Server-Sent Events) to focus on product creation and not on connection management
- Easy and powerful API for subscribing to price updates

## Installation

```bash
npm install @maximemrf/petasos
```

## Example

```ts
import { Petasos } from "@maximemrf/petasos"

const petasos = new Petasos({
  pairs: ["BTC/USD", "SOL/USD"],
  maxReconnectAttempts: 10,
  parsed: true,
})

petasos.getPriceUpdates((data) => {
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
- `pairs`: string[] – List of supported trading pairs (e.g. "BTC/USD"), strictly typed with autocompletion support.
- `maxReconnectAttempts?`: number – Maximum reconnect attempts (default: 5)
- `parsed?`: boolean – Whether to parse updates

### Methods

- `getClient()`: Returns the underlying `HermesClient` instance.
- `getPriceUpdates(handler)`: Registers a callback for price updates.
- `listen()`: Starts listening for price updates.

## License

MIT
