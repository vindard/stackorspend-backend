import fs from 'fs'

import modelDb from "./src/model-db"
import getTransactions from "./src/get-transactions-from-source"
import getTransactionsAndMap from "./src/get-txns-from-source-and-map"


// getTransactions()
getTransactionsAndMap()

// const dataRaw = fs.readFileSync('./sample-txn-data.json', 'utf8')
// const data = JSON.parse(dataRaw)
// modelDb(data)
