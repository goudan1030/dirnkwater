// 临时测试脚本：测试定时任务调度器
require('dotenv').config()
const { connectDB } = require('./db')
const { Alarm } = require('./models/Alarm')
const scheduler = require('./utils/scheduler')

async function test() {
  console.log('开始测试定时任务...')
  
  // 连接数据库
  await connectDB()
  console.log('数据库连接成功')
  
  // 测试查询到期闹钟
  console.log('\n测试查询到期闹钟...')
  const dueAlarms = await Alarm.findDueAlarms()
  console.log(`找到 ${dueAlarms.length} 个到期闹钟`)
  if (dueAlarms.length > 0) {
    dueAlarms.forEach(alarm => {
      console.log(`- 闹钟 ID: ${alarm.id}, 用户ID: ${alarm.userId}, 时间: ${alarm.time}, openid: ${alarm.openid}`)
    })
  }
  
  // 测试定时任务启动
  console.log('\n测试定时任务启动...')
  try {
    scheduler.start()
    console.log('定时任务启动成功')
    
    // 等待 5 秒后停止
    setTimeout(() => {
      scheduler.stop()
      console.log('定时任务已停止')
      process.exit(0)
    }, 5000)
  } catch (error) {
    console.error('定时任务启动失败:', error)
    process.exit(1)
  }
}

test().catch(err => {
  console.error('测试失败:', err)
  process.exit(1)
})
