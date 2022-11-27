import { fetchAllTxns, syncTxns, getStackCost } from "./src/app"

import { getDb } from "./src/services/sqlite"

// API definition
export const StackorSpend = () => {
  return {
    syncTxns,

    fetchTxns: fetchAllTxns,
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
  const db = getDb()

  console.log("Syncing transactions from Galoy...")
  await sos.syncTxns(db)
  console.log("Finished sync.")

  console.log("Fetching transactions from Galoy...")
  const txns = await sos.fetchTxns(db)
  console.log(txns)

  const stackCost = await sos.getStackCost(db)
  console.log("Current (DCA'd) stack cost is:", stackCost)

  db.close()
}

main()
