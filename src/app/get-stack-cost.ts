import { TransactionsRepository } from "../services/sqlite"

export const getStackCost = async (db: Db) => {
  const txns = await TransactionsRepository(db).fetchAll()

  const lastTxn = txns[txns.length - 1]
  // @ts-ignore-next-line no-implicit-any error
  return lastTxn.avg_price_no_pl
}
