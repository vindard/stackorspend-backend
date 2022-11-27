type TRANSACTION_RESPONSE = {
  errors
  data: {
    me: {
      defaultAccount: {
        wallets: {
          transactions: { pageInfo: { hasNextPage: boolean }; edges: Txn[] }
        }[]
      }
    }
  }
}
