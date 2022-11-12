import Galoy from "./services/galoy"

const main = async () => {
  const transactions = await Galoy().fetchTransactions()
  console.log(JSON.stringify(transactions.slice(0, 5), null, 2))
}

export default main
