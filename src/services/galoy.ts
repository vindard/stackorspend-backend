import fs from "fs"
import axios from "axios"

const API_ENDPOINT = "https://api.staging.galoy.io/graphql/"
const GALOY_JWT = process.env.GALOY_JWT
const defaultHeaders = {
  "Accept": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Content-Type": "application/json",
  "Authorization": `Bearer ${GALOY_JWT}`,
}
const galoyRequestsPath = "./src/services/galoy-requests"

const Transactions = fs.readFileSync(`${galoyRequestsPath}/transactions.gql`, "utf8")

const Galoy = () => {
  const fetchTransactions = async () => {
    const allEdges = []
    let hasNextPage = true
    let after = null
    while (hasNextPage) {
      const query = {
        query: Transactions,
        variables: {
          first: 100,
          after,
        },
      }

      const {
        data: { data, errors },
      } = await axios.post(API_ENDPOINT, query, {
        headers: defaultHeaders,
      })

      const { edges, pageInfo } = data.me.defaultAccount.wallets[0].transactions
      console.log({ pageInfo, edges: edges.length })
      // @ts-ignore-next-line no-implicit-any error
      allEdges.push(...edges)

      after = edges[edges.length - 1].cursor
      ;({ hasNextPage } = pageInfo)
    }

    console.log({ allEdges: allEdges.length })
    return allEdges
  }

  return {
    fetchTransactions,
  }
}

export default Galoy
