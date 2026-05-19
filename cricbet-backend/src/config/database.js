require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') })
const knex = require('knex')

const db = knex({
  client: 'pg',
  connection: {
    host:     process.env.DB_HOST,
    port:     Number(process.env.DB_PORT),
    database: process.env.DB_NAME,
    user:     process.env.DB_USER,
    password: String(process.env.DB_PASSWORD),
  },
  pool: { min: 2, max: 10 },
})

module.exports = db