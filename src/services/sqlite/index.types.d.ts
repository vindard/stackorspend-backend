type INPUT_TXN = { id: string; timestamp: number; sats: number; price: number }

type Txn = {
  cursor: string
  node: {
    id: string
    createdAt: number
    settlementAmount: number
    settlementPrice: {
      base: number
    }
  }
}

type Db = import("sqlite").Database
