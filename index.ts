import { fetchAllTxns, syncLatestTxns, getStackCost } from "./src/app"

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
  const sos = StackorSpend()
  const db = await getDb()

  console.log("Syncing transactions from Galoy...")
  await sos.syncTxns(db)
  console.log("Finished sync.")

  console.log("Fetching transactions from local db...")
  const txns = await sos.fetchTxns(db)
  console.log("Last 2 txns:", txns.slice(txns.length - 3, txns.length - 1))

  const stackCost = await sos.getStackCost(db)
  console.log("Current (DCA'd) stack cost is:", stackCost)

  await db.close()
}

main()
