const { getPool } = require('../db')

/**
 * 闹钟模型操作
 */
class AlarmModel {
  /**
   * 根据用户ID查找所有闹钟
   */
  static async findByUserId(userId) {
    const pool = getPool()
    const [rows] = await pool.execute(
      'SELECT * FROM alarms WHERE userId = ? AND deleted = 0 ORDER BY time ASC',
      [userId]
    )
    return rows
  }

  /**
   * 根据ID查找闹钟
   */
  static async findById(alarmId) {
    const pool = getPool()
    const [rows] = await pool.execute(
      'SELECT * FROM alarms WHERE id = ? AND deleted = 0',
      [alarmId]
    )
    return rows[0] || null
  }

  /**
   * 创建闹钟
   */
  static async create(userId, data) {
    const pool = getPool()
    const { time, repeat, message, enabled = true } = data
    
    const [result] = await pool.execute(
      `INSERT INTO alarms (userId, time, repeat, message, enabled) 
       VALUES (?, ?, ?, ?, ?)`,
      [userId, time, repeat, message || '该喝水啦！', enabled ? 1 : 0]
    )
    
    return await this.findById(result.insertId)
  }

  /**
   * 更新闹钟
   */
  static async update(alarmId, data) {
    const pool = getPool()
    const fields = []
    const values = []

    if (data.time !== undefined) {
      fields.push('time = ?')
      values.push(data.time)
    }
    if (data.repeat !== undefined) {
      fields.push('repeat = ?')
      values.push(data.repeat)
    }
    if (data.message !== undefined) {
      fields.push('message = ?')
      values.push(data.message)
    }
    if (data.enabled !== undefined) {
      fields.push('enabled = ?')
      values.push(data.enabled ? 1 : 0)
    }

    if (fields.length === 0) {
      return await this.findById(alarmId)
    }

    values.push(alarmId)
    await pool.execute(
      `UPDATE alarms SET ${fields.join(', ')}, updatedAt = NOW() WHERE id = ?`,
      values
    )

    return await this.findById(alarmId)
  }

  /**
   * 删除闹钟（软删除）
   */
  static async delete(alarmId) {
    const pool = getPool()
    await pool.execute(
      'UPDATE alarms SET deleted = 1, updatedAt = NOW() WHERE id = ?',
      [alarmId]
    )
    return true
  }

  /**
   * 批量保存或更新闹钟（用于同步）
   */
  static async syncAlarms(userId, alarms) {
    const pool = getPool()
    
    // 获取现有闹钟ID列表
    const existingAlarms = await this.findByUserId(userId)
    const existingIds = new Set(existingAlarms.map(a => a.id))
    
    // 准备要保留的ID集合
    const incomingIds = new Set()
    const incomingDbIds = alarms.filter(a => a.id && typeof a.id === 'number').map(a => a.id)
    
    // 处理每个传入的闹钟
    for (const alarm of alarms) {
      const { time, repeat, message, enabled = true } = alarm
      
      if (alarm.id && typeof alarm.id === 'number' && existingIds.has(alarm.id)) {
        // 更新现有闹钟
        await pool.execute(
          `UPDATE alarms SET 
           time = ?, repeat = ?, message = ?, enabled = ?, deleted = 0, updatedAt = NOW()
           WHERE id = ? AND userId = ?`,
          [time, repeat, message || '该喝水啦！', enabled ? 1 : 0, alarm.id, userId]
        )
        incomingIds.add(alarm.id)
      } else {
        // 创建新闹钟
        await this.create(userId, { time, repeat, message, enabled })
      }
    }
    
    // 删除不在新列表中的闹钟（软删除）
    if (incomingDbIds.length > 0) {
      const placeholders = incomingDbIds.map(() => '?').join(',')
      await pool.execute(
        `UPDATE alarms SET deleted = 1, updatedAt = NOW() 
         WHERE userId = ? AND id NOT IN (${placeholders})`,
        [userId, ...incomingDbIds]
      )
    } else {
      // 如果没有传入任何现有ID，标记所有为删除
      await pool.execute(
        'UPDATE alarms SET deleted = 1, updatedAt = NOW() WHERE userId = ?',
        [userId]
      )
    }
    
    return await this.findByUserId(userId)
  }

  /**
   * 查找需要发送提醒的闹钟
   * 返回在当前时间应该触发的闹钟列表
   */
  static async findDueAlarms() {
    const pool = getPool()
    const now = new Date()
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()
    const currentDay = now.getDay() // 0-6, 0=周日
    const today = now.toISOString().split('T')[0] // YYYY-MM-DD
    
    // 格式化当前时间 HH:MM
    const timeStr = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`
    
    // 查找符合条件的闹钟：
    // 1. enabled = 1 且 deleted = 0
    // 2. time 匹配当前时间
    // 3. repeat 类型匹配（daily=每天，weekday=工作日周一到周五，once=仅一次且今天还未发送过）
    const [rows] = await pool.execute(
      `SELECT a.*, u.openid 
       FROM alarms a
       INNER JOIN users u ON a.userId = u.id
       WHERE a.enabled = 1 
       AND a.deleted = 0
       AND a.time = ?
       AND (
         a.repeat = 'daily'
         OR (a.repeat = 'weekday' AND ? BETWEEN 1 AND 5)
         OR (a.repeat = 'once' AND (a.lastSentDate IS NULL OR a.lastSentDate != ?))
       )`,
      [timeStr, currentDay, today]
    )
    
    return rows
  }

  /**
   * 更新闹钟的最后发送时间
   */
  static async updateLastSent(alarmId) {
    const pool = getPool()
    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD
    await pool.execute(
      'UPDATE alarms SET lastSentDate = ?, updatedAt = NOW() WHERE id = ?',
      [today, alarmId]
    )
  }
}

module.exports = { Alarm: AlarmModel }
