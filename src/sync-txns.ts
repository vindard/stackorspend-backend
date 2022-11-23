import { Galoy } from "./services/galoy"

import { TransactionsRepository } from "./services/sqlite"

const syncTxns = async (db) => {
  // Fetch from source
  const transactions = await Galoy().fetchTransactions("./txns.json")

  // Sort fetched
  const txnsAsc = transactions.sort((a: Txn, b: Txn) =>
    a.node.createdAt > b.node.createdAt
      ? 1
      : a.node.createdAt < b.node.createdAt
      ? -1
      : 0,
  )
  // console.log(JSON.stringify(transactions.slice(0, 5), null, 2))

  // Process for local format
  const data: INPUT_TXN[] = txnsAsc.map((tx: Txn) => {
    const {
      settlementAmount,
      settlementPrice: { base },
    } = tx.node
    return { sats: settlementAmount, price: base / 10 ** 6 }
  })

  // Persist locally
  await TransactionsRepository(db).persistMany(data)
}

export default syncTxns
