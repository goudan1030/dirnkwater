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
})
