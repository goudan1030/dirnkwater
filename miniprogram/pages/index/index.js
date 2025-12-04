const app = getApp()
const config = require('../../config.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    newWater:0,
    array:[],
    water:0,
    displayWater: 0,
    displayPercent: 0,
    login:false,
    userInfo: {
      avatarUrl:"/static/user2.png"
    },
    nextAlarmTime: '', // 下次提醒时间
    hasAlarm: false, // 是否有设置闹钟
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 加载当天喝水量
    this.loadTodayWater()
    
    // 恢复用户登录状态
    let login = app.globalData.login || false
    const userInfo = wx.getStorageSync('user')
    console.log('user');
    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true,
        userInfo: userInfo || this.data.userInfo,
        login: login
      })
    }
    
    // 更新下一个闹钟时间
    this.updateNextAlarm()
  },

  /**
   * 加载当天喝水量
   */
  loadTodayWater: function() {
    const token = app.globalData.token || wx.getStorageSync('token')
    if (!token) {
      console.log('未登录，无法加载喝水数据')
      return
    }

    wx.request({
      url: config.baseURL + config.api.getTodayWater,
      method: 'GET',
      header: {
        'Authorization': 'Bearer ' + token
      },
      success: (res) => {
        if (res.data && res.data.code === 0) {
          const currentWater = res.data.data.water || 0
          const percent = Math.min(currentWater / 1500, 1) * 100
          this.setData({
            displayWater: currentWater,
            displayPercent: percent
          })
          console.log('加载喝水数据成功:', currentWater)
        } else {
          console.error('加载喝水数据失败:', res.data)
        }
      },
      fail: (err) => {
        console.error('请求失败:', err)
      }
    })
  },

  // 数字平滑动画
  animateWaterChange(target) {
    const start = this.data.displayWater || 0;
    const end = Number(target) || 0;
    const delta = end - start;
    if (!delta) {
      const finalPercent = Math.min(end / 1500, 1) * 100;
      this.setData({ displayWater: end, displayPercent: finalPercent });
      return;
    }
    const duration = 400;
    const frameDuration = 16;
    const steps = Math.round(duration / frameDuration);
    let currentStep = 0;
    if (this._waterTimer) {
      clearInterval(this._waterTimer);
      this._waterTimer = null;
    }
    this._waterTimer = setInterval(() => {
      currentStep++;
      if (currentStep >= steps) {
        clearInterval(this._waterTimer);
        this._waterTimer = null;
        const finalPercent = Math.min(end / 1500, 1) * 100;
        this.setData({ displayWater: end, displayPercent: finalPercent });
        return;
      }
      const progress = currentStep / steps;
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(start + delta * eased);
      const percent = Math.min(value / 1500, 1) * 100;
      this.setData({ displayWater: value, displayPercent: percent });
    }, frameDuration);
  },

  /**
   * 当刷新按钮点击后，刷新数据；
   */
  reflash(){
    this.loadTodayWater()
    wx.showToast({
      title: '刷新成功！',
    })
  },

  /**
   *清除数据按钮；
   */
  clear(){
    const that = this
    wx.showModal({
      title: '提示',
      content: '确定要清除今天的喝水数据吗？清除完成后请点击刷新按钮',
      cancelText: '取消',
      confirmText: '确定',
      success: function(res) {
        if(res.cancel){
          // 取消
        } else {
          // 确定清除
          const token = app.globalData.token || wx.getStorageSync('token')
          if (!token) {
            wx.showToast({
              title: '请先登录',
              icon: 'none'
            })
            return
          }

          wx.request({
            url: config.baseURL + config.api.clearWater,
            method: 'POST',
            header: {
              'Authorization': 'Bearer ' + token
            },
            success: (result) => {
              if (result.data && result.data.code === 0) {
                wx.showToast({
                  title: '清除成功',
                })
                that.animateWaterChange(0)
              } else {
                wx.showToast({
                  title: result.data?.msg || '清除失败',
                  icon: 'none'
                })
              }
            },
            fail: (err) => {
              console.error('清除失败:', err)
              wx.showToast({
                title: '清除失败',
                icon: 'none'
              })
            }
          })
        }
      }
    })
  },

  /**
   * 增加喝水记录（通用方法）
   */
  addWaterRecord: function(amount) {
    const token = app.globalData.token || wx.getStorageSync('token')
    if (!token) {
      // 未登录，先获取用户信息
      this.requestUserLogin(() => {
        // 登录成功后再次调用
        this.addWaterRecord(amount)
      })
      return
    }

    wx.request({
      url: config.baseURL + config.api.addWater,
      method: 'POST',
      header: {
        'Authorization': 'Bearer ' + token
      },
      data: {
        amount: amount
      },
      success: (res) => {
        if (res.data && res.data.code === 0) {
          const currentWater = res.data.data.water || 0
          wx.showToast({
            title: '记录成功！',
          })
          this.animateWaterChange(currentWater)
          
          // 检查是否达到目标
          if(currentWater > 1500 && currentWater < 4500){
            wx.showModal({
              title: '恭喜',
              content: '你已经完成了今天的喝水目标了哦～',
              cancelText: '下次吧',
              confirmText: '马上分享',
              success: function(res) {
                if(!res.cancel){
                  // 分享逻辑
                }
              }
            })
          } else if(currentWater > 4500){
            wx.showModal({
              title: '提示',
              content: '请勿过多饮水避免水中毒！',
              cancelText: '取消',
              confirmText: '好的',
              success: function(res) {
                // 确认
              }
            })
          }
        } else {
          wx.showToast({
            title: res.data?.msg || '记录失败',
            icon: 'none'
          })
        }
      },
      fail: (err) => {
        console.error('记录失败:', err)
        wx.showToast({
          title: '记录失败',
          icon: 'none'
        })
      }
    })
  },

  /**
   * 请求用户登录
   */
  requestUserLogin: function(callback) {
    const that = this
    wx.getUserProfile({
      desc: '用于完善会员资料',
      success: (res) => {
        console.log('用户资料', res.userInfo)
        const userInfo = res.userInfo
        this.setData({
          userInfo: userInfo,
          login: true
        })
        wx.setStorageSync('user', userInfo)
        app.globalData.userInfo = userInfo
        app.globalData.login = true

        // 更新用户资料到服务器
        const token = app.globalData.token || wx.getStorageSync('token')
        if (token) {
          wx.request({
            url: config.baseURL + config.api.updateProfile,
            method: 'POST',
            header: {
              'Authorization': 'Bearer ' + token
            },
            data: {
              nickName: userInfo.nickName,
              avatarUrl: userInfo.avatarUrl
            },
            success: (result) => {
              if (result.data && result.data.code === 0) {
                wx.showToast({
                  title: '登录成功',
                  icon: 'success'
                })
                console.log('用户信息已同步到服务器')
              }
              if (callback) callback()
            },
            fail: (err) => {
              console.error('同步用户信息失败:', err)
              if (callback) callback()
            }
          })
        } else {
          if (callback) callback()
        }
      },
      fail: (err) => {
        console.error('获取用户信息失败:', err)
      }
    })
  },

  /**
   * 第一个喝水按钮；
   */
  getDrink1(){
    this.addWaterRecord(250)
  },

  /**
   * 第二个喝水按钮；
   */
  getDrink2(){
    this.addWaterRecord(350)
  },

  /**
   * 第三个喝水按钮；
   */
  getDrink3(){
    this.addWaterRecord(500)
  },

  /**
   * 第四个喝水按钮；
   */
  getDrink4(){
    this.addWaterRecord(1000)
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // 页面显示时刷新数据
    this.loadTodayWater()
    // 更新下一个闹钟时间（闹钟可能被修改了）
    this.updateNextAlarm()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    if (this._waterTimer) {
      clearInterval(this._waterTimer);
      this._waterTimer = null;
    }
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  // 分享给朋友
  onShareAppMessage: function (res) { 
    return {
      title: '喝水小助手提醒你快喝水',
      path: 'pages/index/index',
      imageUrl:'/static/share.png',
      success: function (res) {
        console.log("分享成功")
      },
      fail: function (res) {
        console.log("分享失败")
      }
    }
  },
  /**
   * 用户点击分享到朋友圈
   */
  onShareTimeline: function() {
    return {
      title: '喝水小助手提醒你快喝水',
      path: 'index/index',
      // imageUrl:'/static/'
      // query: 'kjbfrom=pyq'
    }
  },

  /**
   * 跳转到闹钟管理页面
   */
  goToAlarm: function() {
    wx.navigateTo({
      url: '/pages/alarm/alarm'
    })
  },

  /**
   * 更新下一个闹钟时间
   */
  updateNextAlarm: function() {
    const token = app.globalData.token || wx.getStorageSync('token')
    
    // 如果已登录，从服务器加载闹钟
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
            this.processAlarmsForNext(alarms)
          } else {
            // 服务器加载失败，使用本地数据
            this.loadAlarmsFromLocal()
          }
        },
        fail: (err) => {
          console.error('加载闹钟列表失败:', err)
          // 使用本地数据
          this.loadAlarmsFromLocal()
        }
      })
    } else {
      // 未登录，使用本地数据
      this.loadAlarmsFromLocal()
    }
  },

  /**
   * 从本地加载闹钟数据
   */
  loadAlarmsFromLocal: function() {
    const alarms = wx.getStorageSync('alarms') || []
    const globalAlarms = app.globalData.alarms || alarms
    this.processAlarmsForNext(globalAlarms)
  },

  /**
   * 处理闹钟数据并计算下一个时间
   */
  processAlarmsForNext: function(alarms) {
    // 过滤出已启用的闹钟
    const enabledAlarms = alarms.filter(alarm => alarm.enabled !== false)
    
    if (enabledAlarms.length === 0) {
      this.setData({
        nextAlarmTime: '',
        hasAlarm: false
      })
      return
    }
    
    // 计算下一个闹钟时间
    const nextAlarm = this.getNextAlarmTime(enabledAlarms)
    
    if (nextAlarm) {
      this.setData({
        nextAlarmTime: nextAlarm.time,
        hasAlarm: true
      })
    } else {
      this.setData({
        nextAlarmTime: '',
        hasAlarm: false
      })
    }
  },

  /**
   * 计算下一个闹钟时间
   */
  getNextAlarmTime: function(alarms) {
    const now = new Date()
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()
    const currentDay = now.getDay() // 0-6, 0=周日
    const currentTimeMinutes = currentHour * 60 + currentMinute
    
    let nextAlarm = null
    let minMinutes = Infinity
    
    alarms.forEach(alarm => {
      if (!alarm.time) return
      
      const [hour, minute] = alarm.time.split(':').map(Number)
      const alarmMinutes = hour * 60 + minute
      
      let shouldShow = false
      let nextMinutes = 0
      
      if (alarm.repeat === 'daily') {
        // 每天重复
        if (alarmMinutes > currentTimeMinutes) {
          // 今天还有这个时间
          shouldShow = true
          nextMinutes = alarmMinutes - currentTimeMinutes
        } else {
          // 今天已过，显示明天的
          shouldShow = true
          nextMinutes = 24 * 60 - currentTimeMinutes + alarmMinutes
        }
      } else if (alarm.repeat === 'weekday') {
        // 工作日（周一到周五）
        const isWeekday = currentDay >= 1 && currentDay <= 5
        if (isWeekday && alarmMinutes > currentTimeMinutes) {
          // 今天是工作日，且今天还有这个时间
          shouldShow = true
          nextMinutes = alarmMinutes - currentTimeMinutes
        } else if (isWeekday && alarmMinutes <= currentTimeMinutes) {
          // 今天是工作日，但时间已过，显示明天（如果明天是工作日）
          shouldShow = true
          nextMinutes = 24 * 60 - currentTimeMinutes + alarmMinutes
        } else {
          // 今天是周末，计算下一个工作日
          let daysUntilNext = 0
          if (currentDay === 0) {
            // 周日，下一个工作日是周一（1天后）
            daysUntilNext = 1
          } else if (currentDay === 6) {
            // 周六，下一个工作日是周一（2天后）
            daysUntilNext = 2
          }
          shouldShow = true
          nextMinutes = daysUntilNext * 24 * 60 - currentTimeMinutes + alarmMinutes
        }
      } else if (alarm.repeat === 'once') {
        // 仅一次，只显示今天还未到的
        if (alarmMinutes > currentTimeMinutes) {
          shouldShow = true
          nextMinutes = alarmMinutes - currentTimeMinutes
        }
      }
      
      if (shouldShow && nextMinutes < minMinutes) {
        minMinutes = nextMinutes
        nextAlarm = alarm
      }
    })
    
    return nextAlarm
  },
})
