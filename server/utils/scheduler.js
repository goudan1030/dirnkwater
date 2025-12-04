const cron = require('node-cron')
const { Alarm } = require('../models/Alarm')
const { getAccessToken } = require('./accessToken')
const { WaterRecord } = require('../models/User')
const axios = require('axios')

/**
 * 定时任务调度器
 * 每分钟检查一次是否有到期的闹钟，并发送订阅消息
 */
class AlarmScheduler {
  constructor() {
    this.task = null
    this.isRunning = false
  }

  /**
   * 启动定时任务
   */
  start() {
    if (this.isRunning) {
      console.log('定时任务已在运行中')
      return
    }

    // 每分钟的第0秒执行（即每分钟整点执行）
    this.task = cron.schedule('0 * * * * *', async () => {
      await this.checkAndSendAlarms()
    }, {
      scheduled: false,
      timezone: 'Asia/Shanghai'
    })

    this.task.start()
    this.isRunning = true
    console.log('闹钟定时任务已启动，每分钟检查一次到期闹钟')
  }

  /**
   * 停止定时任务
   */
  stop() {
    if (this.task) {
      this.task.stop()
      this.isRunning = false
      console.log('闹钟定时任务已停止')
    }
  }

  /**
   * 检查并发送到期闹钟
   */
  async checkAndSendAlarms() {
    try {
      const now = new Date()
      const currentHour = now.getHours()
      const currentMinute = now.getMinutes()
      const timeStr = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`

      // 查找需要发送的闹钟
      const dueAlarms = await Alarm.findDueAlarms()

      if (dueAlarms.length === 0) {
        return // 没有到期的闹钟
      }

      console.log(`[${timeStr}] 找到 ${dueAlarms.length} 个到期闹钟，开始发送订阅消息...`)

      // 获取 access_token
      const accessToken = await getAccessToken()
      if (!accessToken) {
        console.error('获取 access_token 失败，无法发送订阅消息')
        return
      }

      // 发送每个闹钟的订阅消息
      for (const alarm of dueAlarms) {
        try {
          await this.sendAlarmMessage(alarm, accessToken)
          
          // 更新闹钟的最后发送时间（如果是once类型）
          if (alarm.repeat === 'once') {
            await Alarm.updateLastSent(alarm.id)
          }
        } catch (error) {
          console.error(`发送闹钟 ${alarm.id} 的订阅消息失败:`, error.message)
          // 继续处理其他闹钟，不因单个失败而中断
        }
      }

      console.log(`[${timeStr}] 闹钟订阅消息发送完成`)
    } catch (error) {
      console.error('检查到期闹钟时出错:', error)
    }
  }

  /**
   * 发送单个闹钟的订阅消息
   */
  async sendAlarmMessage(alarm, accessToken) {
    try {
      // 获取用户今日喝水量（用于在消息中显示）
      const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD
      let todayWater = 0
      let targetWater = 1500

      try {
        // 获取用户信息（从 alarm 中已有 userId，需要通过 userId 获取用户信息）
        const { User } = require('../models/User')
        const user = await User.findById(alarm.userId)
        if (user) {
          // 获取今日喝水记录
          const waterRecord = await WaterRecord.findByUserAndDate(alarm.userId, today)
          if (waterRecord) {
            todayWater = waterRecord.water || 0
          }
          // 目标水量可以从用户设置中获取，这里先用默认值
        }
      } catch (error) {
        console.warn('获取用户喝水记录失败:', error.message)
      }

      // 构造订阅消息数据
      const templateId = process.env.SUBSCRIBE_TEMPLATE_ID || 'vi7txiPzgsN4Oo-wM8iNRc8ePcOtNpSdmAwiFTHYADE'
      const now = new Date()
      const timeStr = now.toLocaleString('zh-CN', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })

      const messageData = {
        touser: alarm.openid,
        template_id: templateId,
        page: 'pages/index/index',
        miniprogram_state: process.env.MINIPROGRAM_STATE || 'developer',
        lang: 'zh_CN',
        data: {
          thing1: {
            value: alarm.message || '该喝水啦！记得及时补充水分哦～'
          },
          thing2: {
            value: `今日目标：${targetWater}ml`
          },
          time3: {
            value: timeStr
          },
          thing4: {
            value: `已喝 ${todayWater}ml`
          }
        }
      }

      // 发送订阅消息
      const url = `https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=${accessToken}`
      const response = await axios.post(url, messageData)

      if (response.data.errcode === 0) {
        console.log(`闹钟 ${alarm.id} 订阅消息发送成功`)
      } else {
        console.error(`闹钟 ${alarm.id} 订阅消息发送失败:`, response.data.errmsg)
        
        // 如果是用户未订阅的错误，不需要重试
        if (response.data.errcode === 43101) {
          console.log(`用户 ${alarm.openid} 未订阅此消息模板`)
        }
      }
    } catch (error) {
      console.error(`发送闹钟 ${alarm.id} 订阅消息异常:`, error.message)
      throw error
    }
  }
}

// 创建单例实例
const scheduler = new AlarmScheduler()

module.exports = scheduler
