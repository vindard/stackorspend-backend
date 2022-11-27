import { TableNotCreatedYetError } from "../domain/error"
import { Galoy } from "../services/galoy"

import { TransactionsRepository } from "../services/sqlite"

const IMPORT_PAGE_SIZE = 100
const SYNC_PAGE_SIZE = 25

export const importAllTxns = async (db: Db) => {
  // Fetch from source
  const transactions = await Galoy().fetchAllTransactions(".vscode/txns-mainnet.json")
  // const transactions = await Galoy().fetchAllTransactions()

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
      id,
      settlementAmount,
      settlementPrice: { base },
      createdAt: timestamp,
    } = tx.node
    return { id, timestamp, sats: settlementAmount, price: base / 10 ** 6 }
  })

  // Persist locally
  await TransactionsRepository(db).persistMany(data)
}

export const syncLatestTxns = async (db: Db) => {
  const txnsRepo = TransactionsRepository(db)

  const data: INPUT_TXN[] = []
  let transactions: Txn[]
  let lastCursor: string | false | null = null
  let hasNextPage: boolean = true
  let finish = false
  while (hasNextPage && lastCursor !== false && !finish) {
    // Fetch from source
    ;({ transactions, lastCursor, hasNextPage } = await Galoy().fetchTransactionsPage({
      first: SYNC_PAGE_SIZE,
      cursorFetchAfter: lastCursor,
    }))

    // Sort fetched
    const txnsDesc = transactions.sort((a: Txn, b: Txn) =>
      a.node.createdAt < b.node.createdAt
        ? 1
        : a.node.createdAt > b.node.createdAt
        ? -1
        : 0,
    )

    // Process for local format
    for (const tx of txnsDesc) {
      const {
        id,
        settlementAmount,
        settlementPrice: { base },
        createdAt: timestamp,
      } = tx.node

      const txInDb = await txnsRepo.fetchTxn(id)
      if (txInDb instanceof Error && !(txInDb instanceof TableNotCreatedYetError)) {
        throw txInDb
      }
      if (!(txInDb === undefined || txInDb instanceof Error)) {
        finish = true
        break
      }
      console.log(`Writing new txn '${id}'...`)
      data.push({ id, timestamp, sats: settlementAmount, price: base / 10 ** 6 })
    }
  }
  // Persist locally
  await TransactionsRepository(db).persistMany(data)
}
