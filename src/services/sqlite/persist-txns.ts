import crypto from "crypto"
import fs from "fs"

const CREATE_TABLE = fs.readFileSync(
  "./src/services/sqlite/create-txns-table.sql",
  "utf8",
)
const INSERT = fs.readFileSync("./src/services/sqlite/insert-txn.sql", "utf8")

export const persistTxns = ({ db, data }: { db; data: INPUT_TXN[] }) => {
  db.serialize(() => {
    db.run(CREATE_TABLE)

    const stmt = db.prepare(INSERT)
    const now = Date.now()
    for (const i in data) {
      const txn = data[i]
      stmt.run({
        [":sats_amount"]: txn.sats,
        [":timestamp"]: new Date(now + Number(i) * 100_000).toISOString(),
        [":display_currency_per_sat"]: txn.price * 10_000,
        [":offset"]: 12,
        [":display_currency_code"]: "USD",
        [":source_name"]: "galoy",
        [":source_tx_id"]: crypto.randomUUID(),
      })
    }

    stmt.finalize()
  })
}
