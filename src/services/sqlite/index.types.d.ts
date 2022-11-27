type INPUT_TXN = { id: string; timestamp: number; sats: number; price: number }

type Txn = {
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
