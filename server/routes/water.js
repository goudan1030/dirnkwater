const express = require('express')
const router = express.Router()
const { WaterRecord } = require('../models/WaterRecord')
const { authenticateToken } = require('../utils/jwt')

/**
 * 获取今天的日期字符串 (YYYY-MM-DD)
 */
function getTodayDateString() {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * GET /api/water/today
 * 获取今天喝水量
 */
router.get('/today', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId
    const date = getTodayDateString()

    let record = await WaterRecord.findOrCreate(userId, date)

    res.json({
      code: 0,
      msg: '获取成功',
      data: {
        water: record.water,
        date: record.date,
        records: record.records
      }
    })
  } catch (error) {
    console.error('获取喝水记录错误:', error)
    res.json({
      code: 500,
      msg: '服务器错误',
      data: null
    })
  }
})

/**
 * POST /api/water/add
 * 增加喝水记录
 */
router.post('/add', authenticateToken, async (req, res) => {
  try {
    const { amount } = req.body
    const userId = req.user.userId
    const date = getTodayDateString()

    if (!amount || amount <= 0) {
      return res.json({
        code: 400,
        msg: '喝水量必须大于 0',
        data: null
      })
    }

    // 查找或创建今天的记录
    let record = await WaterRecord.findOrCreate(userId, date)

    // 增加喝水量
    const newWater = record.water + amount
    const newRecords = [...record.records, {
      amount,
      time: new Date()
    }]

    // 更新记录
    await WaterRecord.update(record.id, {
      water: newWater,
      records: newRecords
    })

    record.water = newWater
    record.records = newRecords

    res.json({
      code: 0,
      msg: '记录成功',
      data: {
        water: record.water,
        date: record.date
      }
    })
  } catch (error) {
    console.error('增加喝水记录错误:', error)
    res.json({
      code: 500,
      msg: '服务器错误',
      data: null
    })
  }
})

/**
 * POST /api/water/clear
 * 清空今天喝水量
 */
router.post('/clear', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId
    const date = getTodayDateString()

    let record = await WaterRecord.findOrCreate(userId, date)

    // 清空记录
    await WaterRecord.update(record.id, {
      water: 0,
      records: []
    })

    record.water = 0
    record.records = []

    res.json({
      code: 0,
      msg: '清除成功',
      data: {
        water: 0,
        date: record.date
      }
    })
  } catch (error) {
    console.error('清除喝水记录错误:', error)
    res.json({
      code: 500,
      msg: '服务器错误',
      data: null
    })
  }
})

/**
 * GET /api/water/history
 * 获取历史记录（可选功能）
 */
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId
    const { startDate, endDate, limit = 30 } = req.query

    const records = await WaterRecord.getHistory(userId, startDate, endDate, limit)

    res.json({
      code: 0,
      msg: '获取成功',
      data: records
    })
  } catch (error) {
    console.error('获取历史记录错误:', error)
    res.json({
      code: 500,
      msg: '服务器错误',
      data: null
    })
  }
})

module.exports = router

