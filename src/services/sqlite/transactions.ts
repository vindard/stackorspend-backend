import crypto from "crypto"
import fs from "fs"

import { sleep } from "../../domain/common"
import { BASE_TXNS_SELECT, handleRow } from "./requests/select-txns"

const REQUESTS_DIR = "./src/services/sqlite/requests"

const CREATE_TABLE = fs.readFileSync(`${REQUESTS_DIR}/create-txns-table.sql`, "utf8")
const INSERT = fs.readFileSync(`${REQUESTS_DIR}/insert-txn.sql`, "utf8")

export const TransactionsRepository = (db) => {
  const fetchAll = async () => {
    // @ts-ignore-next-line no-implicit-any error
    const { acc, rows } = await new Promise((resolve) => {
      let acc = { avg_price_no_pl: 0, agg_fiat_no_pl: 0 }
      let prev = { prev_agg_sats: 0, prev_avg_price: 0 }

      let newRow,
        newRows = []
      db.all(BASE_TXNS_SELECT, (err, rows) => {
        for (const row of rows) {
          ;({ acc, prev, row: newRow } = handleRow({ acc, prev, row }))
          // @ts-ignore-next-line no-implicit-any error
          newRows.push(newRow)
        }
        resolve({ acc, rows: newRows })
      })
    })

    return rows
  }

  const persistMany = async (data: INPUT_TXN[]) => {
    db.serialize(() => {
      db.run(CREATE_TABLE)

      const stmt = db.prepare(INSERT)
      const now = Date.now()
      for (const i in data) {
        const txn = data[i]
        stmt.run({
          [":sats_amount"]: txn.sats,
          [":timestamp"]: new Date(txn.timestamp * 1000).toISOString(),
          [":display_currency_per_sat"]: Math.round(txn.price * 10 ** 4),
          [":display_currency_offset"]: 12,
          [":display_currency_code"]: "USD",
          [":source_name"]: "galoy",
          [":source_tx_id"]: crypto.randomUUID(),
        })
      }

      stmt.finalize()
    })

    // FIXME: use async sqlite library to wait on finalize completion instead
    await sleep(1)
  }

  return {
    persistMany,
    fetchAll,
  }
}
