const { getPool } = require('../db')

/**
 * 用户模型操作
 */
class UserModel {
  /**
   * 根据 openid 查找用户
   */
  static async findByOpenid(openid) {
    const pool = getPool()
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE openid = ?',
      [openid]
    )
    return rows[0] || null
  }

  /**
   * 根据 ID 查找用户
   */
  static async findById(userId) {
    const pool = getPool()
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    )
    return rows[0] || null
  }

  /**
   * 创建用户
   */
  static async create(openid, nickName = '', avatarUrl = '') {
    const pool = getPool()
    const [result] = await pool.execute(
      'INSERT INTO users (openid, nickName, avatarUrl) VALUES (?, ?, ?)',
      [openid, nickName, avatarUrl]
    )
    return {
      id: result.insertId,
      openid,
      nickName,
      avatarUrl
    }
  }

  /**
   * 更新用户信息
   */
  static async update(userId, data) {
    const pool = getPool()
    const fields = []
    const values = []

    if (data.nickName !== undefined) {
      fields.push('nickName = ?')
      values.push(data.nickName)
    }
    if (data.avatarUrl !== undefined) {
      fields.push('avatarUrl = ?')
      values.push(data.avatarUrl)
    }

    if (fields.length === 0) {
      return await this.findById(userId)
    }

    values.push(userId)
    await pool.execute(
      `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
      values
    )

    return await this.findById(userId)
  }

  /**
   * 查找或创建用户
   */
  static async findOrCreate(openid, nickName = '', avatarUrl = '') {
    let user = await this.findByOpenid(openid)
    if (!user) {
      user = await this.create(openid, nickName, avatarUrl)
    }
    return user
  }
}

/**
 * 喝水记录模型操作
 */
class WaterRecordModel {
  /**
   * 查找今天的记录
   */
  static async findByUserAndDate(userId, date) {
    const pool = getPool()
    const [rows] = await pool.execute(
      'SELECT * FROM water_records WHERE userId = ? AND date = ?',
      [userId, date]
    )
    return rows[0] || null
  }

  /**
   * 创建今天的记录
   */
  static async create(userId, date, water = 0, records = []) {
    const pool = getPool()
    const recordsJson = JSON.stringify(records)
    const [result] = await pool.execute(
      'INSERT INTO water_records (userId, date, water, records) VALUES (?, ?, ?, ?)',
      [userId, date, water, recordsJson]
    )
    return {
      id: result.insertId,
      userId,
      date,
      water,
      records: records
    }
  }

  /**
   * 更新记录
   */
  static async update(recordId, data) {
    const pool = getPool()
    const fields = []
    const values = []

    if (data.water !== undefined) {
      fields.push('water = ?')
      values.push(data.water)
    }
    if (data.records !== undefined) {
      fields.push('records = ?')
      values.push(JSON.stringify(data.records))
    }

    if (fields.length === 0) {
      return await this.findById(recordId)
    }

    values.push(recordId)
    await pool.execute(
      `UPDATE water_records SET ${fields.join(', ')} WHERE id = ?`,
      values
    )

    return await this.findById(recordId)
  }

  /**
   * 根据 ID 查找记录
   */
  static async findById(recordId) {
    const pool = getPool()
    const [rows] = await pool.execute(
      'SELECT * FROM water_records WHERE id = ?',
      [recordId]
    )
    if (rows[0]) {
      rows[0].records = rows[0].records ? JSON.parse(rows[0].records) : []
    }
    return rows[0] || null
  }

  /**
   * 查找或创建今天的记录
   */
  static async findOrCreate(userId, date) {
    let record = await this.findByUserAndDate(userId, date)
    if (!record) {
      record = await this.create(userId, date, 0, [])
    } else {
      // 解析 JSON 字段
      record.records = record.records ? JSON.parse(record.records) : []
    }
    return record
  }

  /**
   * 获取历史记录
   */
  static async getHistory(userId, startDate = null, endDate = null, limit = 30) {
    const pool = getPool()
    let sql = 'SELECT * FROM water_records WHERE userId = ?'
    const params = [userId]

    if (startDate && endDate) {
      sql += ' AND date >= ? AND date <= ?'
      params.push(startDate, endDate)
    }

    sql += ' ORDER BY date DESC LIMIT ?'
    params.push(parseInt(limit))

    const [rows] = await pool.execute(sql, params)
    
    // 解析 JSON 字段
    return rows.map(row => ({
      ...row,
      records: row.records ? JSON.parse(row.records) : []
    }))
  }
}

module.exports = { User: UserModel, WaterRecord: WaterRecordModel }
