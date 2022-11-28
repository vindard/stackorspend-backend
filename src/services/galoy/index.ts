import fs from "fs"
import axios from "axios"

const { API_ENDPOINT, GALOY_JWT } = process.env
if (!API_ENDPOINT) throw new Error(`Missing 'API_ENDPOINT' env variable`)

const defaultHeaders = {
  "Accept": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Content-Type": "application/json",
  "Authorization": `Bearer ${GALOY_JWT}`,
}
const galoyRequestsPath = "./src/services/galoy/requests"

const Transactions = fs.readFileSync(`${galoyRequestsPath}/transactions.gql`, "utf8")
const Balance = fs.readFileSync(`${galoyRequestsPath}/balance.gql`, "utf8")

export const Galoy = () => {
  const balance = async () => {
    console.log("Fetching galoy wallet balance...")

    const query = {
      query: Balance,
    }

    const {
      data: { data, errors },
    }: { data: BALANCE_RESPONSE } = await axios.post(API_ENDPOINT, query, {
      headers: defaultHeaders,
    })

    const {
      me: {
        defaultAccount: {
          wallets: [{ balance }],
        },
      },
    } = data

    return balance
  }

  const fetchTransactionsPage = async ({
    first,
    cursorFetchAfter = null,
  }: {
    first: number
    cursorFetchAfter: string | null
  }) => {
    console.log("Fetching galoy txns...")

    const query = {
      query: Transactions,
      variables: {
        first,
        after: cursorFetchAfter,
      },
    }

    const {
      data: { data, errors },
    }: { data: TRANSACTION_RESPONSE } = await axios.post(API_ENDPOINT, query, {
      headers: defaultHeaders,
    })

    const { edges, pageInfo } = data.me.defaultAccount.wallets[0].transactions
    console.log("Page:", { pageInfo, edges: edges.length })

    const { cursor }: { cursor: string | false } =
      edges && edges.length ? edges[edges.length - 1] : { cursor: false }
    const { hasNextPage } = pageInfo

    console.log(`Fetched ${edges.length} galoy txns for page`)
    return { transactions: edges, lastCursor: cursor, hasNextPage }
  }

  return {
    balance,
    fetchTransactionsPage,
  }
}
