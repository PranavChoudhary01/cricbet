exports.up = async (knex) => {
  await knex.schema

    .createTable('users', (t) => {
      t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      t.string('username', 20).unique().notNullable();
      t.string('email').unique().notNullable();
      t.string('password_hash').notNullable();
      t.decimal('wallet_balance', 14, 2).defaultTo(0);
      t.enum('status', ['active', 'suspended', 'banned']).defaultTo('active');
      t.timestamps(true, true);
    })

    .createTable('matches', (t) => {
      t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      t.string('team_a').notNullable();
      t.string('team_b').notNullable();
      t.string('match_type');       // IPL, Test, ODI, T20I
      t.string('venue');
      t.timestamp('start_time');
      t.enum('status', ['upcoming', 'live', 'completed', 'abandoned']).defaultTo('upcoming');
      t.string('result');           // team_a_win | draw | team_b_win
      t.timestamps(true, true);
    })

    .createTable('odds', (t) => {
      t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      t.uuid('match_id').references('id').inTable('matches').onDelete('CASCADE');
      t.enum('selection_type', ['team_a_win', 'draw', 'team_b_win']).notNullable();
      t.decimal('odds_value', 8, 2).notNullable();
      t.boolean('is_suspended').defaultTo(false);
      t.timestamp('updated_at').defaultTo(knex.fn.now());
    })

    .createTable('bets', (t) => {
      t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      t.uuid('user_id').references('id').inTable('users');
      t.uuid('match_id').references('id').inTable('matches');
      t.enum('selection', ['team_a_win', 'draw', 'team_b_win']).notNullable();
      t.decimal('odds_at_placement', 8, 2).notNullable();  // snapshot at bet time
      t.decimal('stake_amount', 14, 2).notNullable();
      t.decimal('potential_payout', 14, 2).notNullable();
      t.enum('status', ['pending', 'won', 'lost', 'void', 'cancelled']).defaultTo('pending');
      t.timestamp('settled_at').nullable();
      t.timestamps(true, true);
    })

    .createTable('transactions', (t) => {
      t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      t.uuid('user_id').references('id').inTable('users');
      t.enum('type', ['deposit', 'withdrawal', 'bet_placed', 'bet_won', 'bet_refund']).notNullable();
      t.decimal('amount', 14, 2).notNullable();
      t.uuid('reference_id').nullable();
      t.decimal('balance_before', 14, 2);
      t.decimal('balance_after', 14, 2);
      t.timestamps(true, true);
    });

  // Indexes for performance
  await knex.schema.raw('CREATE INDEX idx_bets_user ON bets(user_id)');
  await knex.schema.raw('CREATE INDEX idx_bets_match ON bets(match_id)');
  await knex.schema.raw('CREATE INDEX idx_bets_status ON bets(status)');
  await knex.schema.raw('CREATE INDEX idx_txn_user ON transactions(user_id)');
};

exports.down = async (knex) => {
  await knex.schema
    .dropTableIfExists('transactions')
    .dropTableIfExists('bets')
    .dropTableIfExists('odds')
    .dropTableIfExists('matches')
    .dropTableIfExists('users');
};
