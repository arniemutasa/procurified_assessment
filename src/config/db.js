require("dotenv").config();
const {Pool} = require("pg");


const connectionString = process.env.DATABASE_URL;

if(!connectionString){
    console.warn(`DATABASE_URL is not set in your environment variables. Please set it in your .env file in the root of the prohect`)
}

const pool = new Pool({
    connectionString,
    max: Number(process.env.PG_POOL_MAX || 10),
    idleTimeoutMillis: Number(process.env.PG_IDLE_TIMEOUT_MS || 30000),
    connectionTimeoutMillis: Number(process.env.PG_CONNECTION_TIMEOUT_MS || 5000)
})

// When db connecction dies while in the pool
pool.on('error', (err)=>{
    console.error(`Idle client error: ${err}`);
});

module.exports = pool;