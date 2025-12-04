const app = getApp()
const config = require('../../config.js')

Page({
  /**
   * 页面的初始数据
   */
  data: {
    statusBarHeight: 0,
    navBarHeight: 0,
    alarmList: [],
    showModal: false,
    isEdit: false,
    currentIndex: -1,
    currentTime: '',
    currentRepeat: 'daily',
    currentMessage: '',
    repeatOptions: [
      { label: '每天', value: 'daily', selected: true },
      { label: '工作日', value: 'weekday', selected: false },
      { label: '仅一次', value: 'once', selected: false }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获取系统信息
    const systemInfo = wx.getSystemInfoSync()
    const statusBarHeight = systemInfo.statusBarHeight || 0
    const navBarHeight = statusBarHeight + 44
    
    this.setData({
      statusBarHeight: statusBarHeight,
      navBarHeight: navBarHeight
    })
    
    this.loadAlarms()
  },

  /**
   * 返回上一页
   */
  goBack: function() {
    wx.navigateBack()
  },

  /**
   * 加载闹钟列表
   */
  loadAlarms: function() {
    const token = app.globalData.token || wx.getStorageSync('token')
    
    // 如果已登录，从服务器加载
    if (token) {
      wx.request({
        url: config.baseURL + config.api.alarmList,
        method: 'GET',
        header: {
          'Authorization': 'Bearer ' + token
        },
        success: (res) => {
          if (res.data && res.data.code === 0) {
            const alarms = res.data.data || []
            this.processAlarms(alarms)
            
            // 同时保存到本地存储作为备份
            wx.setStorageSync('alarms', alarms.map(a => {
              const { repeatText, ...rest } = a
              return rest
            }))
          } else {
            // 如果服务器加载失败，从本地加载
            this.loadAlarmsFromLocal()
          }
        },
        fail: (err) => {
          console.error('从服务器加载闹钟失败:', err)
          // 从本地存储加载
          this.loadAlarmsFromLocal()
        }
      })
    } else {
      // 未登录，从本地加载
      this.loadAlarmsFromLocal()
    }
  },

  /**
   * 从本地存储加载闹钟列表
   */
  loadAlarmsFromLocal: function() {
    const alarms = wx.getStorageSync('alarms') || []
    this.processAlarms(alarms)
  },

  /**
   * 处理闹钟列表数据
   */
  processAlarms: function(alarms) {
    // 按时间排序
    const sortedAlarms = alarms.sort((a, b) => {
      const timeA = this.timeToMinutes(a.time)
      const timeB = this.timeToMinutes(b.time)
      return timeA - timeB
    })
    
    // 处理重复显示文本
    const alarmList = sortedAlarms.map(alarm => {
      return {
        ...alarm,
        enabled: alarm.enabled !== undefined ? alarm.enabled : true,
        repeatText: this.getRepeatText(alarm.repeat)
      }
    })
    
    this.setData({
      alarmList: alarmList
    })
    
    // 同步到全局数据，供首页使用
    app.globalData.alarms = alarmList
  },

  /**
   * 时间转换为分钟数（用于排序）
   */
  timeToMinutes: function(time) {
    const [hours, minutes] = time.split(':').map(Number)
    return hours * 60 + minutes
  },

  /**
   * 获取重复显示文本
   */
  getRepeatText: function(repeat) {
    const map = {
      'daily': '每天',
      'weekday': '工作日',
      'once': '仅一次'
    }
    return map[repeat] || '每天'
  },

  /**
   * 添加闹钟
   */
  addAlarm: function() {
    this.setData({
      showModal: true,
      isEdit: false,
      currentIndex: -1,
      currentTime: '',
      currentRepeat: 'daily',
      currentMessage: '',
      repeatOptions: [
        { label: '每天', value: 'daily', selected: true },
        { label: '工作日', value: 'weekday', selected: false },
        { label: '仅一次', value: 'once', selected: false }
      ]
    })
  },

  /**
   * 编辑闹钟
   */
  editAlarm: function(e) {
    const index = e.currentTarget.dataset.index
    const alarm = this.data.alarmList[index]
    
    // 设置重复选项选中状态
    const repeatOptions = this.data.repeatOptions.map(option => {
      return {
        ...option,
        selected: option.value === alarm.repeat
      }
    })
    
    this.setData({
      showModal: true,
      isEdit: true,
      currentIndex: index,
      currentTime: alarm.time,
      currentRepeat: alarm.repeat,
      currentMessage: alarm.message || '',
      repeatOptions: repeatOptions
    })
  },

  /**
   * 时间改变
   */
  onTimeChange: function(e) {
    this.setData({
      currentTime: e.detail.value
    })
  },

  /**
   * 选择重复类型
   */
  selectRepeat: function(e) {
    const value = e.currentTarget.dataset.value
    const repeatOptions = this.data.repeatOptions.map(option => {
      return {
        ...option,
        selected: option.value === value
      }
    })
    
    this.setData({
      currentRepeat: value,
      repeatOptions: repeatOptions
    })
  },

  /**
   * 输入提醒内容
   */
  onMessageInput: function(e) {
    this.setData({
      currentMessage: e.detail.value
    })
  },

  /**
   * 删除闹钟
   */
  deleteAlarm: function(e) {
    const index = e.currentTarget.dataset.index
    const alarm = this.data.alarmList[index]
    
    wx.showModal({
      title: '提示',
      content: `确定要删除 ${alarm.time} 的闹钟吗？`,
      cancelText: '取消',
      confirmText: '删除',
      confirmColor: '#EA6E69',
      success: (res) => {
        if (res.confirm) {
          // 如果闹钟有数据库ID，尝试从服务器删除
          const token = app.globalData.token || wx.getStorageSync('token')
          if (token && alarm.id && typeof alarm.id === 'number') {
            wx.request({
              url: config.baseURL + config.api.alarmDelete + '/' + alarm.id,
              method: 'DELETE',
              header: {
                'Authorization': 'Bearer ' + token
              },
              success: (result) => {
                // 无论成功失败，都从本地删除
                this.removeAlarmFromList(index)
              },
              fail: (err) => {
                console.error('从服务器删除闹钟失败:', err)
                // 失败也继续从本地删除
                this.removeAlarmFromList(index)
              }
            })
          } else {
            // 没有ID，直接本地删除
            this.removeAlarmFromList(index)
          }
        }
      }
    })
  },

  /**
   * 从列表中移除闹钟
   */
  removeAlarmFromList: function(index) {
    let alarmList = [...this.data.alarmList]
    alarmList.splice(index, 1)
    
    this.setData({
      alarmList: alarmList
    })
    
    this.saveAlarms()
    
    wx.showToast({
      title: '删除成功',
      icon: 'success'
    })
  },

  /**
   * 切换闹钟开关
   */
  toggleAlarm: function(e) {
    const index = e.currentTarget.dataset.index
    const enabled = e.detail.value
    const alarmList = this.data.alarmList
    
    alarmList[index].enabled = enabled
    
    this.setData({
      alarmList: alarmList
    })
    
    this.saveAlarms()
    
    wx.showToast({
      title: enabled ? '闹钟已开启' : '闹钟已关闭',
      icon: 'success',
      duration: 1500
    })
  },

  /**
   * 保存闹钟
   */
  saveAlarm: function() {
    const { currentTime, currentRepeat, currentMessage, isEdit, currentIndex } = this.data
    
    if (!currentTime) {
      wx.showToast({
        title: '请选择时间',
        icon: 'none'
      })
      return
    }
    
    const alarmData = {
      id: isEdit ? this.data.alarmList[currentIndex].id : Date.now(),
      time: currentTime,
      repeat: currentRepeat,
      message: currentMessage || '该喝水啦！',
      enabled: isEdit ? this.data.alarmList[currentIndex].enabled : true,
      repeatText: this.getRepeatText(currentRepeat)
    }
    
    let alarmList = [...this.data.alarmList]
    
    if (isEdit) {
      // 编辑
      alarmList[currentIndex] = alarmData
    } else {
      // 添加
      alarmList.push(alarmData)
    }
    
    // 重新排序
    alarmList = alarmList.sort((a, b) => {
      const timeA = this.timeToMinutes(a.time)
      const timeB = this.timeToMinutes(b.time)
      return timeA - timeB
    })
    
    this.setData({
      alarmList: alarmList,
      showModal: false
    })
    
    this.saveAlarms()
    
    wx.showToast({
      title: isEdit ? '修改成功' : '添加成功',
      icon: 'success'
    })
    
    // 如果是新增，提示用户订阅消息
    if (!isEdit) {
      setTimeout(() => {
        this.requestSubscribeMessage()
      }, 1500)
    }
  },

  /**
   * 请求订阅消息授权
   * 参考文档：https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/subscribe-message.html
   */
  requestSubscribeMessage: function() {
    // 订阅消息模板ID - 需要与 mine.js 中的保持一致
    const SUBSCRIBE_TEMPLATE_ID = 'vi7txiPzgsN4Oo-wM8iNRc8ePcOtNpSdmAwiFTHYADE'
    
    wx.requestSubscribeMessage({
      tmplIds: [SUBSCRIBE_TEMPLATE_ID],
      success: (res) => {
        if (res[SUBSCRIBE_TEMPLATE_ID] === 'accept') {
          wx.showToast({
            title: '订阅成功',
            icon: 'success'
          })
          // 可以在这里保存订阅状态到服务器
        } else if (res[SUBSCRIBE_TEMPLATE_ID] === 'reject') {
          wx.showToast({
            title: '已取消订阅',
            icon: 'none'
          })
        }
      },
      fail: (err) => {
        console.error('订阅消息授权失败:', err)
        wx.showToast({
          title: '订阅失败，请重试',
          icon: 'none'
        })
      }
    })
  },

  /**
   * 保存闹钟列表到本地存储并同步到服务器
   */
  saveAlarms: function() {
    const alarmList = this.data.alarmList.map(alarm => {
      // 保存时去掉 repeatText，这个是显示用的
      const { repeatText, ...rest } = alarm
      return rest
    })
    
    // 保存到本地存储
    wx.setStorageSync('alarms', alarmList)
    
    // 同步到全局数据
    const alarmListWithText = this.data.alarmList
    app.globalData.alarms = alarmListWithText
    
    // 如果已登录，同步到服务器
    const token = app.globalData.token || wx.getStorageSync('token')
    if (token) {
      wx.request({
        url: config.baseURL + config.api.alarmSync,
        method: 'POST',
        header: {
          'Authorization': 'Bearer ' + token,
          'content-type': 'application/json'
        },
        data: {
          alarms: alarmList
        },
        success: (res) => {
          if (res.data && res.data.code === 0) {
            console.log('闹钟同步到服务器成功')
            // 更新本地ID为服务器返回的ID
            if (res.data.data && res.data.data.length > 0) {
              const serverAlarms = res.data.data
              this.processAlarms(serverAlarms)
              wx.setStorageSync('alarms', serverAlarms.map(a => {
                const { repeatText, ...rest } = a
                return rest
              }))
            }
          } else {
            console.error('闹钟同步失败:', res.data?.msg)
          }
        },
        fail: (err) => {
          console.error('闹钟同步请求失败:', err)
        }
      })
    }
    
    // 通知首页更新下次提醒时间
    const pages = getCurrentPages()
    if (pages.length > 0) {
      const prevPage = pages[0]
      if (prevPage.route === 'pages/index/index' && prevPage.updateNextAlarm) {
        prevPage.updateNextAlarm()
      }
    }
  },

  /**
   * 关闭弹窗
   */
  closeModal: function() {
    this.setData({
      showModal: false
    })
  },

  /**
   * 阻止事件冒泡
   */
  stopPropagation: function() {
    // 阻止点击弹窗内容时关闭弹窗
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // 页面显示时刷新闹钟列表
    this.loadAlarms()
  }
})

