const express = require('express')
const axios = require('axios')
const router = express.Router()
const { authenticateToken } = require('../utils/jwt')
const { getAccessToken } = require('../utils/accessToken')
const { User } = require('../models/User')

/**
 * POST /api/subscribe/add
 * 保存用户订阅消息信息
 */
router.post('/add', authenticateToken, async (req, res) => {
  try {
    const { templateId } = req.body
    const userId = req.user.userId

    // 这里可以扩展：保存用户的订阅消息状态到数据库
    // 目前先简单返回成功，后续可以根据需要添加订阅消息记录表

    res.json({
      code: 0,
      msg: '订阅成功',
      data: {
        templateId: templateId
      }
    })
  } catch (error) {
    console.error('保存订阅消息错误:', error)
    res.json({
      code: 500,
      msg: '服务器错误',
      data: null
    })
  }
})

/**
 * POST /api/subscribe/send
 * 发送订阅消息
 * 参考文档：https://developers.weixin.qq.com/miniprogram/dev/OpenApiDoc/mp-message-management/subscribe-message/sendMessage.html
 */
router.post('/send', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId
    const { templateId, time, message, todayWater, targetWater } = req.body

    // 获取用户信息
    const user = await User.findById(userId)
    if (!user) {
      return res.json({
        code: 404,
        msg: '用户不存在',
        data: null
      })
    }

    // 获取 access_token
    const accessToken = await getAccessToken()

    // 构造订阅消息数据
    // 模板字段：thing1（提醒内容）、thing2（提醒事项）、time3（提醒时间）、thing4（状态信息）
    const messageData = {
      touser: user.openid,
      template_id: templateId || process.env.SUBSCRIBE_TEMPLATE_ID || 'vi7txiPzgsN4Oo-wM8iNRc8ePcOtNpSdmAwiFTHYADE',
      page: 'pages/index/index', // 点击消息跳转的页面
      miniprogram_state: process.env.MINIPROGRAM_STATE || 'developer', // 开发版：developer，正式版：formal，体验版：trial
      lang: 'zh_CN',
      data: {
        thing1: {
          value: message || '该喝水啦！记得及时补充水分哦～'
        },
        thing2: {
          value: `今日目标：${targetWater || 1500}ml`
        },
        time3: {
          value: time || new Date().toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
        },
        thing4: {
          value: `已喝 ${todayWater || 0}ml`
        }
      }
    }

    // 发送订阅消息
    const url = `https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=${accessToken}`
    const response = await axios.post(url, messageData)

    if (response.data.errcode === 0) {
      res.json({
        code: 0,
        msg: '发送成功',
        data: null
      })
    } else {
      console.error('发送订阅消息失败:', response.data)
      res.json({
        code: response.data.errcode || 500,
        msg: response.data.errmsg || '发送失败',
        data: null
      })
    }
  } catch (error) {
    console.error('发送订阅消息错误:', error)
    res.json({
      code: 500,
      msg: '服务器错误: ' + (error.message || '未知错误'),
      data: null
    })
  }
})

/**
 * POST /api/subscribe/send-alarm
 * 发送闹钟提醒的订阅消息
 */
router.post('/send-alarm', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId
    const { alarmTime, message, todayWater, targetWater } = req.body

    // 获取用户信息
    const user = await User.findById(userId)
    if (!user) {
      return res.json({
        code: 404,
        msg: '用户不存在',
        data: null
      })
    }

    // 获取 access_token
    const accessToken = await getAccessToken()

    // 订阅消息模板ID
    const templateId = process.env.SUBSCRIBE_TEMPLATE_ID || 'vi7txiPzgsN4Oo-wM8iNRc8ePcOtNpSdmAwiFTHYADE'

    // 构造订阅消息数据
    // 模板字段：thing1（提醒内容）、thing2（提醒事项）、time3（提醒时间）、thing4（状态信息）
    const messageData = {
      touser: user.openid,
      template_id: templateId,
      page: 'pages/index/index',
      miniprogram_state: process.env.MINIPROGRAM_STATE || 'developer',
      lang: 'zh_CN',
      data: {
        thing1: {
          value: message || '该喝水啦！记得及时补充水分哦～'
        },
        thing2: {
          value: `今日目标：${targetWater || 1500}ml`
        },
        time3: {
          value: alarmTime || new Date().toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
        },
        thing4: {
          value: `已喝 ${todayWater || 0}ml`
        }
      }
    }

    // 发送订阅消息
    const url = `https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=${accessToken}`
    const response = await axios.post(url, messageData)

    if (response.data.errcode === 0) {
      res.json({
        code: 0,
        msg: '发送成功',
        data: null
      })
    } else {
      console.error('发送订阅消息失败:', response.data)
      
      // 根据错误码返回友好提示
      let errorMsg = '发送失败'
      if (response.data.errcode === 43101) {
        errorMsg = '用户未订阅此消息，请先授权'
      } else if (response.data.errcode === 40037) {
        errorMsg = '订阅消息模板ID无效'
      } else {
        errorMsg = response.data.errmsg || '发送失败'
      }

      res.json({
        code: response.data.errcode || 500,
        msg: errorMsg,
        data: null
      })
    }
  } catch (error) {
    console.error('发送订阅消息错误:', error)
    res.json({
      code: 500,
      msg: '服务器错误: ' + (error.message || '未知错误'),
      data: null
    })
  }
})

module.exports = router

