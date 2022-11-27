import { Galoy } from "../services/galoy"

import { TransactionsRepository } from "../services/sqlite"

export const syncTxns = async (db) => {
  // Fetch from source
  const transactions = await Galoy().fetchTransactions(".vscode/txns-mainnet.json")
  // const transactions = await Galoy().fetchTransactions()

  // Sort fetched
  const txnsAsc = transactions.sort((a: Txn, b: Txn) =>
    a.node.createdAt > b.node.createdAt
      ? 1
      : a.node.createdAt < b.node.createdAt
      ? -1
      : 0,
  )

  // Process for local format
  const data: INPUT_TXN[] = txnsAsc.map((tx: Txn) => {
    const {
      settlementAmount,
      settlementPrice: { base },
      createdAt: timestamp,
    } = tx.node
    return { sats: settlementAmount, price: base / 10 ** 6, timestamp }
  })

  // Persist locally
  await TransactionsRepository(db).persistMany(data)
}
