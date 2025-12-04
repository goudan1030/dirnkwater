const express = require('express')
const router = express.Router()
const { authenticateToken } = require('../utils/jwt')
const { Alarm } = require('../models/Alarm')

/**
 * GET /api/alarm/list
 * 获取用户的所有闹钟
 */
router.get('/list', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId
    const alarms = await Alarm.findByUserId(userId)
    
    res.json({
      code: 0,
      msg: '获取成功',
      data: alarms
    })
  } catch (error) {
    console.error('获取闹钟列表错误:', error)
    res.json({
      code: 500,
      msg: '服务器错误',
      data: null
    })
  }
})

/**
 * POST /api/alarm/add
 * 添加闹钟
 */
router.post('/add', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId
    const { time, repeat, message, enabled } = req.body

    if (!time) {
      return res.json({
        code: 400,
        msg: '请选择闹钟时间',
        data: null
      })
    }

    const alarm = await Alarm.create(userId, {
      time,
      repeat: repeat || 'daily',
      message: message || '该喝水啦！',
      enabled: enabled !== undefined ? enabled : true
    })

    res.json({
      code: 0,
      msg: '添加成功',
      data: alarm
    })
  } catch (error) {
    console.error('添加闹钟错误:', error)
    res.json({
      code: 500,
      msg: '服务器错误',
      data: null
    })
  }
})

/**
 * PUT /api/alarm/update/:id
 * 更新闹钟
 */
router.put('/update/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId
    const alarmId = req.params.id
    const { time, repeat, message, enabled } = req.body

    // 验证闹钟是否属于该用户
    const existingAlarm = await Alarm.findById(alarmId)
    if (!existingAlarm || existingAlarm.userId !== userId) {
      return res.json({
        code: 404,
        msg: '闹钟不存在',
        data: null
      })
    }

    const updateData = {}
    if (time !== undefined) updateData.time = time
    if (repeat !== undefined) updateData.repeat = repeat
    if (message !== undefined) updateData.message = message
    if (enabled !== undefined) updateData.enabled = enabled

    const alarm = await Alarm.update(alarmId, updateData)

    res.json({
      code: 0,
      msg: '更新成功',
      data: alarm
    })
  } catch (error) {
    console.error('更新闹钟错误:', error)
    res.json({
      code: 500,
      msg: '服务器错误',
      data: null
    })
  }
})

/**
 * DELETE /api/alarm/delete/:id
 * 删除闹钟
 */
router.delete('/delete/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId
    const alarmId = req.params.id

    // 验证闹钟是否属于该用户
    const existingAlarm = await Alarm.findById(alarmId)
    if (!existingAlarm || existingAlarm.userId !== userId) {
      return res.json({
        code: 404,
        msg: '闹钟不存在',
        data: null
      })
    }

    await Alarm.delete(alarmId)

    res.json({
      code: 0,
      msg: '删除成功',
      data: null
    })
  } catch (error) {
    console.error('删除闹钟错误:', error)
    res.json({
      code: 500,
      msg: '服务器错误',
      data: null
    })
  }
})

/**
 * POST /api/alarm/sync
 * 同步闹钟列表（批量保存）
 */
router.post('/sync', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId
    const { alarms } = req.body

    if (!Array.isArray(alarms)) {
      return res.json({
        code: 400,
        msg: '闹钟列表格式错误',
        data: null
      })
    }

    const syncedAlarms = await Alarm.syncAlarms(userId, alarms)

    res.json({
      code: 0,
      msg: '同步成功',
      data: syncedAlarms
    })
  } catch (error) {
    console.error('同步闹钟错误:', error)
    res.json({
      code: 500,
      msg: '服务器错误',
      data: null
    })
  }
})

module.exports = router
