import { fetchAllTxns, syncTxns } from "./src/app"

import { getDb } from "./src/services/sqlite"

// API definition
export const StackorSpend = () => {
  return {
    syncTxns,
    fetchAllTxns,

    // getStackPrice,
    // checkPlannedStackTxn,
    // checkPlannedSpendTxn,

    // payNoAmountLnInvoice,
    // payWithAmountLnInvoice,
    // receiveLnNoAmount,
    // receiveLnWithAmount,
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
  const txns = await sos.fetchAllTxns(db)
  console.log(txns.slice(0, 3))

  db.close()
}

main()
