import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'yuumpy',
  port: parseInt(process.env.DB_PORT || '3306'),
  connectionLimit: 5,
  queueLimit: 0,
  waitForConnections: true,
  idleTimeout: 60000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000
};

// Use global to prevent multiple pools during hot reloading in development
const globalForDb = globalThis as unknown as { pool: mysql.Pool | undefined };

export async function getConnection() {
  if (!globalForDb.pool) {
    try {
      globalForDb.pool = mysql.createPool(dbConfig);
      console.log('Database pool created successfully');
    } catch (error) {
      console.error('Database pool creation error:', error);
      throw error;
    }
  }
  return globalForDb.pool;
}

export async function query(sql: string, params?: any[]) {
  try {
    const pool = await getConnection();
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (error) {
    // Handle missing table errors gracefully
    if (error.message && error.message.includes("doesn't exist")) {
      console.log(`Table not found, returning empty result for query: ${sql.substring(0, 50)}...`);
      return [];
    }
    
    console.error('Database query error:', error);
    console.error('SQL:', sql);
    console.error('Params:', params);
    throw error;
  }
}

export async function closeConnection() {
  if (globalForDb.pool) {
    await globalForDb.pool.end();
    globalForDb.pool = undefined;
  }
}