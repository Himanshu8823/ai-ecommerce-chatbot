import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ecommerce_chatbot_db',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

let pool = null;
let isConnected = false;

try {
  pool = mysql.createPool(dbConfig);
} catch (err) {
  console.warn('[DB] Failed to create MySQL pool:', err.message);
}

export const testDbConnection = async () => {
  if (!pool) return false;
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    isConnected = true;
    console.log(`🐬 Connected successfully to MySQL Database [${dbConfig.database}] at ${dbConfig.host}:${dbConfig.port}`);
    return true;
  } catch (err) {
    isConnected = false;
    console.log(`ℹ️ [MySQL Info] Could not connect to MySQL server (${err.code || err.message}).`);
    console.log(`👉 To connect: Set your MySQL password in 'backend/.env' (DB_PASSWORD=your_password).`);
    return false;
  }
};

export const query = async (sql, params = []) => {
  if (!isConnected || !pool) {
    throw new Error('MySQL is not currently connected.');
  }
  const [results] = await pool.execute(sql, params);
  return results;
};

export const isDbConnected = () => isConnected;

export default pool;
