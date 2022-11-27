import { TransactionsRepository } from "../services/sqlite"

export const fetchAllTxns = async (db: Db) => TransactionsRepository(db).fetchAll()
