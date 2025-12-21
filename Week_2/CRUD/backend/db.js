import pg from "pg";
const { Pool } = pg;

// Database Pooling Config
const pool = new Pool({
    user: "postgres",       
    password: "1234", 
    host: "localhost",
    port: 5432,
    database: "CRUD"     
});

export default pool;         