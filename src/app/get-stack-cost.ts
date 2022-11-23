import { TransactionsRepository } from "../services/sqlite"

export const getStackCost = async (db) => {
  const txns = await TransactionsRepository(db).fetchAll()

  // @ts-ignore-next-line no-implicit-any error
  const lastTxn = txns[txns.length - 1]
  return lastTxn.avg_price_no_pl
}
