import { TransactionsRepository } from "./services/sqlite"

export default async (db) => TransactionsRepository(db).fetchAll()
