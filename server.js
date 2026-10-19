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
    if (/authentication failed|bad auth/i.test(error.message)) {
      console.error('MongoDB rejected the username or password in MONGO_URI.')
      console.error('In Atlas, open Database Access, reset the password for this database user, and paste that password into MONGO_URI between the colon and the @. Leave no spaces.')
    } else {
      console.error(error.message)
    }
    process.exit(1)
  })
