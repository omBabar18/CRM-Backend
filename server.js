require('dotenv').config()
const app = require('./app')
const { connectDb } = require('./config/db')
const { seedIfEmpty } = require('./services/seed')

const port = Number(process.env.PORT) || 5000

connectDb()
  .then(seedIfEmpty)
  .then(() => {
    app.listen(port, () => console.log(`DG Gold API listening on ${port}`))
  })
  .catch((error) => {
    console.error('Could not start the API')
    console.error(error.message)
    process.exit(1)
  })
