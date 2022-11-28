type INPUT_TXN = {
  id: string
  timestamp: number
  sats: number
  price: number
  status: string
}

type Txn = {
  cursor: string
  node: {
    id: string
    createdAt: number
    settlementAmount: number
    settlementPrice: {
      base: number
    }
    status: string
  }
}

type Db = import("sqlite").Database
