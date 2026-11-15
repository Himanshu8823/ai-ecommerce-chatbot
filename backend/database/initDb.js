import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend directory
dotenv.config({ path: path.join(__dirname, '../.env') });

async function initDatabase() {
  const host = process.env.DB_HOST || 'localhost';
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const port = parseInt(process.env.DB_PORT || '3306', 10);

  console.log(`\n⏳ Attempting to initialize MySQL Database at ${host}:${port} as '${user}'...`);

  let connection;
  try {
    // 1. Connect without selecting database to ensure DB creation
    connection = await mysql.createConnection({
      host,
      user,
      password,
      port,
      multipleStatements: true
    });

    console.log('✅ Connected to MySQL server.');

    // 2. Read schema.sql
    const schemaPath = path.join(__dirname, 'schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf-8');

    console.log('🚀 Executing schema.sql (Creating tables & inserting sample data)...');
    await connection.query(sql);

    console.log('🎉 MySQL Database & all tables created successfully!');
    console.log('   - customers');
    console.log('   - products');
    console.log('   - orders & order_items');
    console.log('   - payments');
    console.log('   - deliveries');
    console.log('   - returns');
    console.log('   - refunds');
    console.log('   - faqs');
    console.log('   - chat_history');
    console.log('Sample test data successfully populated.\n');

  } catch (error) {
    console.error('\n❌ Database initialization error:', error.message);
    console.error('👉 Please ensure your MySQL password is set in backend/.env:');
    console.error('   DB_PASSWORD=your_actual_mysql_password\n');
  } finally {
    if (connection) await connection.end();
  }
}

initDatabase();
