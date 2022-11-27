type INPUT_TXN = { sats: number; price: number; timestamp: number }

type Txn = {
  node: {
    createdAt: number
    settlementAmount: number
    settlementPrice: {
      base: number
    }
  }
}
