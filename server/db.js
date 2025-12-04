const mysql = require('mysql2/promise')

const dbConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  port: process.env.MYSQL_PORT || 3306,
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'drink',
  charset: process.env.MYSQL_CHARSET || 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
}

// 创建连接池
let pool = null

/**
 * 连接 MySQL 数据库
 */
async function connectDB() {
  try {
    pool = mysql.createPool(dbConfig)
    
    // 测试连接
    const connection = await pool.getConnection()
    console.log('MySQL 连接成功')
    connection.release()
    
    // 初始化数据库表
    await initTables()
  } catch (error) {
    console.error('MySQL 连接失败:', error)
    process.exit(1)
  }
}

/**
 * 初始化数据库表
 */
async function initTables() {
  try {
    // 创建 users 表
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        openid VARCHAR(100) UNIQUE NOT NULL,
        nickName VARCHAR(100) DEFAULT '',
        avatarUrl VARCHAR(500) DEFAULT '',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_openid (openid)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)

    // 创建 water_records 表
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS water_records (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId INT NOT NULL,
        date VARCHAR(10) NOT NULL,
        water INT DEFAULT 0,
        records JSON,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uk_user_date (userId, date),
        INDEX idx_userId (userId),
        INDEX idx_date (date),
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)

    console.log('数据库表初始化完成')
  } catch (error) {
    console.error('初始化数据库表失败:', error)
  }
}

/**
 * 获取数据库连接池
 */
function getPool() {
  if (!pool) {
    throw new Error('数据库未连接，请先调用 connectDB()')
  }
  return pool
}

module.exports = { connectDB, getPool }
