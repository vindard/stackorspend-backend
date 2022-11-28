import { TableNotCreatedYetError } from "../domain/error"
import { Galoy } from "../services/galoy"

import { TransactionsRepository } from "../services/sqlite"

export const syncLatestTxns = async ({db, pageSize}: {db: Db, pageSize: number}) => {
  const txnsRepo = TransactionsRepository(db)

  const data: INPUT_TXN[] = []
  let transactions: Txn[]
  let lastCursor: string | false | null = null
  let hasNextPage: boolean = true
  let finish = false
  while (hasNextPage && lastCursor !== false && !finish) {
    // Fetch from source
    ;({ transactions, lastCursor, hasNextPage } = await Galoy().fetchTransactionsPage({
      first: pageSize,
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
