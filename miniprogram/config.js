// API 配置文件
module.exports = {
  baseURL: 'https://drink.loner.cc/api',
  // 接口路径（已包含在 baseURL 中，这里只需要相对路径）
  api: {
    // 登录/获取 openid
    login: '/auth/login',
    // 更新用户资料
    updateProfile: '/user/profile',
    // 查询当天喝水量
    getTodayWater: '/water/today',
    // 增加喝水记录
    addWater: '/water/add',
    // 清空当天喝水量
    clearWater: '/water/clear',
    // 订阅消息相关
    subscribeAdd: '/subscribe/add',
    subscribeSend: '/subscribe/send',
    subscribeSendAlarm: '/subscribe/send-alarm',
    // 闹钟相关
    alarmList: '/alarm/list',
    alarmSync: '/alarm/sync',
    alarmAdd: '/alarm/add',
    alarmUpdate: '/alarm/update',
    alarmDelete: '/alarm/delete'
  }
}

