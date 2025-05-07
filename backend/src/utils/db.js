const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT, // Default PostgreSQL port is 5432
});

// Optional: Add an event listener for connection errors
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(1); // Exit process with failure
});

// Optional: Add a simple query to check the connection on startup
pool.query('SELECT NOW()', (err, res) => {
  if (err) console.error('Database connection check failed:', err.message);
  else console.log('PostgreSQL connected successfully');
});

module.exports = pool;

module.exports = connectDB;
