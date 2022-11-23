import sqlite3Pre from "sqlite3"
const sqlite3 = sqlite3Pre.verbose()

export const getDb = () => {
  const dbConfig = {
    memory: {
      path: ":memory:",
      connectMsg: "Connected to the in-memory SQLite database.",
    },
    testDisk: {
      path: "test.db",
      connectMsg: "Connected to 'test.db database.",
    },
  }

  const { path, connectMsg } = dbConfig.testDisk
  return new sqlite3.Database(path, (err) => {
    if (err) {
      return console.error(err.message)
    }
    console.log(connectMsg)
  })
}
