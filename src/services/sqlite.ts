import crypto from "crypto"

import sqlite3Pre from "sqlite3"

const sqlite3 = sqlite3Pre.verbose()

const CREATE_TABLE = `
  CREATE TABLE IF NOT EXISTS transactions (
    sats_amount INTEGER NOT NULL CHECK (NOT sats_amount = 1234),    
    timestamp TEXT,
    display_currency_per_sat INTEGER,
    offset INTEGER,
    display_currency_code TEXT,
    display_amount TEXT GENERATED ALWAYS AS (
      sats_amount * display_currency_per_sat / POWER(10, offset)
    ) STORED,
    source_name TEXT,
    source_tx_id TEXT
  )`

const INSERT = `  INSERT INTO transactions (
    sats_amount,
    timestamp,
    display_currency_per_sat,
    offset,
    display_currency_code,
    source_name,
    source_tx_id
  ) VALUES (
    :sats_amount,    
    :timestamp,
    :display_currency_per_sat,
    :offset,
    :display_currency_code,
    :source_name,
    :source_tx_id
  )
`

const SELECT = "SELECT * FROM transactions"

const AGG_SATS_FRAG = `SUM(sats_amount) OVER(ORDER BY timestamp)`
const PRICE_PER_BTC_FRAG = `display_currency_per_sat / POWER(10, offset - 8)`
const PRICE_FRAG = `display_currency_per_sat / POWER(10, offset)`
const FIAT_TOTAL_FRAG = `sats_amount * ${PRICE_FRAG}`
const AGG_FIAT_WITH_PL_FRAG = `SUM(${FIAT_TOTAL_FRAG}) OVER(ORDER BY timestamp)`

const TEST_SELECT = `
  SELECT
    timestamp,
    sats_amount,
    ${PRICE_PER_BTC_FRAG} as price,
    ${AGG_SATS_FRAG} as agg_sats,
    '' as _,

    ${FIAT_TOTAL_FRAG} as fiat_with_pl,
    ${AGG_FIAT_WITH_PL_FRAG} as agg_fiat_with_pl,
    CASE
      WHEN NOT sats_amount = 0 THEN ${AGG_FIAT_WITH_PL_FRAG} / ${AGG_SATS_FRAG} * POWER(10,8)
      ELSE null
    END as avg_price_with_pl,
    '' as __

    -- Columns no_pl go here
    -- '' as ___

  FROM transactions
`
const populate = ({ db, data }: { db; data: INPUT_TXN[] }) => {
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

const handleRow = ({ acc, prev, row }: { acc; prev; row }) => {
  let { avg_price_no_pl, agg_fiat_no_pl } = acc
  let { prev_agg_sats, prev_avg_price } = prev

  const { sats_amount, price, agg_sats, fiat_with_pl } = row
  let fiat_no_pl
  if (sats_amount > 0) {
    // isBuy
    fiat_no_pl = (sats_amount / 10 ** 8) * price
    agg_fiat_no_pl += fiat_no_pl
    avg_price_no_pl = agg_fiat_no_pl / (agg_sats / 10 ** 8)

    prev_avg_price = avg_price_no_pl
  } else {
    // isSell
    fiat_no_pl = sats_amount * (agg_fiat_no_pl / prev_agg_sats)
    agg_fiat_no_pl += fiat_no_pl
    avg_price_no_pl = prev_avg_price

    prev_avg_price = prev_avg_price // No change to prev_avg_price
  }
  const fiat_pl = -(fiat_no_pl - fiat_with_pl)
  const pl_pct = (fiat_pl / fiat_no_pl) * 100

  prev_agg_sats = agg_sats

  console.log({
    ...row,
    fiat_no_pl: fiat_no_pl.toFixed(2),
    fiat_pl: fiat_pl.toFixed(2),
    pl_pct: `${pl_pct.toFixed(2)}%`,
    agg_fiat_no_pl: agg_fiat_no_pl.toFixed(2),
    avg_price_no_pl: avg_price_no_pl.toFixed(2),
  })

  return {
    acc: { avg_price_no_pl, agg_fiat_no_pl },
    prev: { prev_agg_sats, prev_avg_price },
  }
}

const calculateCurrentStackPrice = async (db) => {
  const acc = await new Promise((resolve) => {
    let acc = { avg_price_no_pl: 0, agg_fiat_no_pl: 0 }
    let prev = { prev_agg_sats: 0, prev_avg_price: 0 }

    db.all(TEST_SELECT, (err, rows) => {
      for (const row of rows) {
        ;({ acc, prev } = handleRow({ acc, prev, row }))
      }
      resolve(acc)
    })
  })

  // @ts-ignore-next-line no-implicit-any error
  const { agg_fiat_no_pl, avg_price_no_pl } = acc

  return {
    agg_fiat_no_pl: agg_fiat_no_pl.toFixed(2),
    avg_price_no_pl: avg_price_no_pl.toFixed(2),
  }
}

const buildTable = async (db) => {
  // Intra-SQL calcs only
  // db.all(TEST_SELECT, (err, rows) => {
  //   console.log(rows)
  // })

  // Application calcs added
  // @ts-ignore-next-line no-implicit-any error
  const { agg_fiat_no_pl, avg_price_no_pl } = await calculateCurrentStackPrice(db)
  console.log("HERE:", { agg_fiat_no_pl, avg_price_no_pl })
}

const main = async ({ fetchPrice, data }: { fetchPrice; data: INPUT_TXN[] }) => {
  const db = new sqlite3.Database(":memory:", (err) => {
    if (err) {
      return console.error(err.message)
    }
    console.log("Connected to the in-memory SQlite database.")
  })

  populate({ db, data })

  buildTable(db)
  db.close()
}

export default main
