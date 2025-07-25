// import { Petasos } from "./build/index.js"
// import fs from "fs"

// (async () => {
//   const petasos = new Petasos({
//     priceIds: ["0x93da3352f9f1d105fdfe4971cfa80e9dd777bfc5d0f683ebb6e1294b92137bb7"],
//     parsed: true,
//     maxReconnectAttempts: 5,
//   })

//   const feeds = await petasos.getClient().getPriceFeeds()

//   const PAIRS = Object.fromEntries(
//     feeds.map(feed => [feed.attributes.display_symbol, feed.id])
//   )

//   fs.writeFileSync(
//     "feeds.ts",
//     `export const PAIRS = ${JSON.stringify(PAIRS, null, 2)} as const;\n`
//   )
// })()
