import sqlite from "./services/sqlite"
import price from "./services/price"

const main = (data) => sqlite({ fetchPrice: price, data })

export default main
