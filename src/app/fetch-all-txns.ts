import { TransactionsRepository } from "../services/sqlite"

export const fetchAllTxns = async (db) => TransactionsRepository(db).fetchAll()
