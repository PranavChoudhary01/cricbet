require('dotenv').config()

module.exports = {
  client: 'pg',
  connection: {
    host:     process.env.DB_HOST,
    port:     Number(process.env.DB_PORT),
    database: process.env.DB_NAME,
    user:     process.env.DB_USER,
    password: String(process.env.DB_PASSWORD),
  },
  migrations: {
    directory: './scripts/migrations'
  }
}