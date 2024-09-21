import pg from 'pg';

const { Pool } = pg;

let localPoolConfig = {
    user: 'postgres', // Updated user
    password: 'allpha01', // Updated password
    host: 'localhost',
    port: '5432', 
    database: 'jwttutorial' // Updated database name
};

const poolConfig = process.env.DATABASE_URL ? {
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  } : localPoolConfig;

const pool = new Pool(poolConfig);
export default pool;
