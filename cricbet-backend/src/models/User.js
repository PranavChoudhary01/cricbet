const db = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static async create({ username, email, password }) {
    const hash = await bcrypt.hash(password, 12);
    const [user] = await db('users')
      .insert({ username, email, password_hash: hash, wallet_balance: 0 })
      .returning(['id', 'username', 'email', 'wallet_balance', 'created_at']);
    return user;
  }

  static async findByEmail(email) {
    return db('users').where({ email }).first();
  }

  static async findById(id) {
    return db('users')
      .where({ id })
      .select('id', 'username', 'email', 'wallet_balance', 'status')
      .first();
  }

  static async verifyPassword(plain, hash) {
    return bcrypt.compare(plain, hash);
  }

  static async getBalance(userId) {
    const user = await db('users').where({ id: userId }).select('wallet_balance').first();
    return user?.wallet_balance ?? 0;
  }
}

module.exports = User;
