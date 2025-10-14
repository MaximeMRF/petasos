# Petasos

A modern, powerful and experimental client for the [Pyth Network Hermes service](https://www.pyth.network/).
“Petasos” refers to the wide-brimmed hat worn by the Greek god Hermes, the messenger of the gods.

## Features

- Subscribe to crypto feeds using human-readable trading pairs with IDE autocompletion instead of raw price IDs
- Handles SSE (Server-Sent Events) to focus on product creation and not on connection management
- Easy and powerful API to subscribe to price updates
- Automatically parse prices

## Installation

```bash
npm install @maximemrf/petasos
```

## Example without autoParse

```ts
import { Petasos } from "@maximemrf/petasos"

const petasos = new Petasos({
  pairs: ["BTC/USD", "SOL/USD"],
  maxReconnectAttempts: 10,
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

## Example with autoParse

```ts
import { Petasos } from "@maximemrf/petasos"

const petasos = new Petasos({
  pairs: ["BTC/USD", "SOL/USD", "EUR/USD"],
  maxReconnectAttempts: 10,
  // set to true
  autoParse: true,
})

petasos.getPriceUpdates((data) => {
  console.log(data['BTC/USD'])
  // you can convert sol to euro by doing that:
  console.log(data['SOL/USD'] / data['EUR/USD'])
})

await petasos.listen()
```

## API

### `Petasos(options: PetasosOptions)`

- `url?`: string – Hermes service URL (default: `https://hermes.pyth.network`)
- `pairs`: string[] – List of supported trading pairs (e.g. "BTC/USD"), strictly typed with autocompletion support.
- `maxReconnectAttempts?`: number – Maximum reconnect attempts (default: 5)
- `autoParse?`: boolean –  If enabled, automatically parses price updates into a key-value structure accessible via data["SOL/USD"], data["BTC/USD"], etc

### Methods

- `getClient()`: Returns the underlying `HermesClient` instance.
- `getPriceUpdates(handler)`: Registers a callback for price updates.
- `listen()`: Starts listening for price updates.

## License

MIT
