import fs from "fs"

import modelDb from "./src/model-db"
import getTransactionsAndMap from "./src/get-txns-from-source-and-map"

// const dataRaw = fs.readFileSync("./sample-txn-data.json", "utf8")
// const data = JSON.parse(dataRaw)
// modelDb(data)

getTransactionsAndMap()
