const express = require('express')
const cors = require('cors')
const { requireAuth } = require('./middleware/auth')

const app = express()

app.use(cors({ origin: ['http://localhost:5173', 'http://127.0.0.1:5173'] }))
app.use(express.json())

app.get('/api/health', (_req, res) => res.json({ ok: true }))
app.use('/api/auth', require('./routes/auth'))
app.use('/api/leads', requireAuth, require('./routes/leads'))
app.use('/api/customers', requireAuth, require('./routes/customers'))
app.use('/api/gold', requireAuth, require('./routes/gold'))
app.use('/api/desk', requireAuth, require('./routes/desk'))
app.use('/api/workspace', requireAuth, require('./routes/workspace'))

app.use((error, _req, res, _next) => {
  console.error(error)
  res.status(500).json({ message: 'Something went wrong' })
})

module.exports = app
