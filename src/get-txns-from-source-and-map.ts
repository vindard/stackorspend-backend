import sqlite from "./services/sqlite"
import price from "./services/price"
import Galoy from "./services/galoy"

const main = async () => {
  const transactions = await Galoy().fetchTransactions()
  const txnsAsc = transactions.sort((a, b) =>
    a.node.createdAt > b.node.createdAt ? 1 : a.node.createdAt < b.node.createdAt ? -1 : 0,
  )
  // console.log(JSON.stringify(transactions.slice(0, 5), null, 2))

  const data: INPUT_TXN[] = txnsAsc.map(tx => {
    const { settlementAmount, settlementPrice: { base } } = tx.node
    return { sats: settlementAmount, price: base / 10 ** 6 }
  })

  sqlite({ fetchPrice: price, data })
}

export default main
