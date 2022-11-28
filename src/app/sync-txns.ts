import {
  LocalBalanceDoesNotMatchSourceError,
  TableNotCreatedYetError,
} from "../domain/error"
import { Galoy } from "../services/galoy"

import { TransactionsRepository } from "../services/sqlite"

export const syncLatestTxns = async ({
  db,
  pageSize,
  rescan = false,
}: {
  db: Db
  pageSize: number
  rescan?: boolean // continues scanning through all txns to find all missing txns
}) => {
  // TODO: Figure out how to fix mismatched/corrupted txns on rescan

  const txnsRepo = TransactionsRepository(db)

  const data: INPUT_TXN[] = []
  let transactions: Txn[]
  let lastCursor: string | false | null = null
  let hasNextPage: boolean = true
  let finish = false
  while ((rescan || !finish) && hasNextPage && lastCursor !== false) {
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
        status,
      } = tx.node

      const txInDb = await txnsRepo.fetchTxn(id)
      if (txInDb instanceof Error && !(txInDb instanceof TableNotCreatedYetError)) {
        throw txInDb
      }
      if (!(txInDb === undefined || txInDb instanceof Error)) {
        finish = true
        continue
      }
      console.log(`Writing new txn '${id}'...`)
      data.push({ id, timestamp, sats: settlementAmount, price: base / 10 ** 6, status })
    }
  }
  // Persist locally
  await TransactionsRepository(db).persistMany(data)

  // Check balance
  // Note: figure how to handle pending transactions that disappear later (e.g. RBF)
  const sumFromLocal = await TransactionsRepository(db).sumSatsAmount()
  const balanceFromSource = await Galoy().balance()
  if (sumFromLocal !== balanceFromSource) {
    return new LocalBalanceDoesNotMatchSourceError()
  }

  return true
}
