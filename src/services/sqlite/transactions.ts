import { persistTxns } from "./persist-txns"
import { selectTxns } from "./select-txns"

export const TransactionsRepository = (db) => {
  return {
    persistMany: (data) => persistTxns({ db, data }),
    fetchAll: () => selectTxns(db),
  }
}
