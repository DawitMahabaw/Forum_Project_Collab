import mysql from "mysql2/promise";
import env from "./env.js";

// Create a MySQL connection pool so the application can
// efficiently reuse database connections across requests.
const pool = mysql.createPool({
  host: env.database.host,
  port: env.database.port,
  user: env.database.user,
  password: env.database.password,
  database: env.database.name,

  // Enable verified SSL for cloud databases such as Aiven.
  ...(process.env.DB_SSL_CA
    ? {
        ssl: {
          ca: process.env.DB_SSL_CA,
          rejectUnauthorized: true,
        },
      }
    : {}),

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000,
});

export default pool;
