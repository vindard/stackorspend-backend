import { fetchAllTxns, syncLatestTxns, getStackCost } from "./src/app"
import { TableNotCreatedYetError } from "./src/domain/error"

import { getDb, TransactionsRepository } from "./src/services/sqlite"

// API definition
export const StackorSpend = () => {
  return {
    // TODO: Change this to be able to also check balance and resync if inconsistent
    syncTxns: syncLatestTxns,

    // TODO: Add a paginated option here for loading for Transactions view
    fetchTxns: fetchAllTxns,
    // TODO: Write state to separate table on initial sync & resync
    //       (instead of calculating in SELECT)
    getStackCost,
    // checkPlannedStackTxn,
    // checkPlannedSpendTxn,

    // payNoAmountLnInvoice,
    // payWithAmountLnInvoice,
    // receiveLnNoAmount,
    // receiveLnWithAmount,

    // payOnChainAddress,
    // receiveOnChain,
  }
}

// Demo API usage
const main = async () => {
  const IMPORT_PAGE_SIZE = 100
  const SYNC_PAGE_SIZE = 10

  const sos = StackorSpend()
  const db = await getDb()

  console.log("Syncing transactions from Galoy...")
  const exists = await TransactionsRepository(db).checkTableExists("transactions")
  if (exists instanceof Error) throw exists
  await sos.syncTxns({
    db,
    pageSize: exists ? SYNC_PAGE_SIZE : IMPORT_PAGE_SIZE,
  })
  console.log("Finished sync.")

  console.log("Fetching transactions from local db...")
  const txns = await sos.fetchTxns(db)
  if (txns instanceof Error) throw txns
  console.log("Last 2 txns:", txns.slice(txns.length - 3, txns.length - 1))

  const stackCost = await sos.getStackCost(db)
  console.log("Current (DCA'd) stack cost is:", stackCost)

  await db.close()
}

main()
