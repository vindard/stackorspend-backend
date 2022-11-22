import Galoy from "./services/galoy"

import sqlite3Pre from "sqlite3"
const sqlite3 = sqlite3Pre.verbose()

import { TransactionsRepository } from "./services/sqlite/transactions"

type Txn = {
  node: {
    createdAt: number
    settlementAmount: number
    settlementPrice: {
      base: number
    }
  }
}

export const sqlite = async (data) => {
  const getDb = () =>
    new sqlite3.Database(":memory:", (err) => {
      if (err) {
        return console.error(err.message)
      }
      console.log("Connected to the in-memory SQlite database.")
    })

  const db = getDb()
  const txns = TransactionsRepository(db)

  txns.persistMany(data)

  const allTxns = await txns.fetchAll()
  console.log("HERE 1:", allTxns)

  db.close()
}

const main = async () => {
  const transactions = await Galoy().fetchTransactions()
  const txnsAsc = transactions.sort((a: Txn, b: Txn) =>
    a.node.createdAt > b.node.createdAt
      ? 1
      : a.node.createdAt < b.node.createdAt
      ? -1
      : 0,
  )
  // console.log(JSON.stringify(transactions.slice(0, 5), null, 2))

  const data: INPUT_TXN[] = txnsAsc.map((tx: Txn) => {
    const {
      settlementAmount,
      settlementPrice: { base },
    } = tx.node
    return { sats: settlementAmount, price: base / 10 ** 6 }
  })

  sqlite(data)
}

export default main
