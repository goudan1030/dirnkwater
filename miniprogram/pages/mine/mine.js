// 订阅消息模板ID
const SUBSCRIBE_TEMPLATE_ID = 'vi7txiPzgsN4Oo-wM8iNRc8ePcOtNpSdmAwiFTHYADE'
const app = getApp()
const config = require('../../config.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    water:0,
    login:false,
    userInfo: {
      avatarUrl:"/static/user2.png",
      nickName:'马上登录'
    },
    avatarUrl:null,
    hasUserInfo: false,
    canIUseGetUserProfile: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const userInfo = wx.getStorageSync('user')
    let login = app.globalData.login || false
    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true,
        userInfo: userInfo || this.data.userInfo,
        login: login
      })
    }
  },

  /**
   * 获取用户登录信息
   */
  getUserProfile(){
    const that = this
    wx.getUserProfile({
      desc: '用于完善会员资料',
      success: (res) => {
        console.log('用户资料', res.userInfo)
        const userInfo = res.userInfo
        this.setData({
          userInfo: userInfo,
          login: true,
          avatarUrl: userInfo.avatarUrl,
          hasUserInfo: true
        })
        wx.setStorageSync('user', userInfo)
        app.globalData.userInfo = userInfo
        app.globalData.login = true

        // 同步用户信息到服务器
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
              } else {
                console.error('同步用户信息失败:', result.data)
              }
            },
            fail: (err) => {
              console.error('同步用户信息请求失败:', err)
            }
          })
        } else {
          // 如果没有 token，先尝试登录
          app.doLogin()
          wx.showToast({
            title: '登录成功',
            icon: 'success'
          })
        }
      },
      fail: (err) => {
        console.error('获取用户信息失败:', err)
      }
    })
  },

  /**
   * 开启订阅消息
   */
  sub(e){
    // 请求用户授权订阅消息（根据微信官方文档：https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/subscribe-message.html）
    wx.requestSubscribeMessage({
      tmplIds: [SUBSCRIBE_TEMPLATE_ID],
      success(res) {
        if (res[SUBSCRIBE_TEMPLATE_ID] === 'accept') {
          // 订阅成功，可以调用后端接口保存订阅信息
          const token = app.globalData.token || wx.getStorageSync('token')
          if (token) {
            wx.request({
              url: config.baseURL + config.api.subscribeAdd,
              method: 'POST',
              header: {
                'Authorization': 'Bearer ' + token
              },
              data: {
                templateId: SUBSCRIBE_TEMPLATE_ID
              },
              success: (result) => {
                if (result.data && result.data.code === 0) {
                  wx.showToast({
                    title: '订阅消息开启成功',
                    icon: 'success'
                  })
                }
              },
              fail: (err) => {
                console.error('保存订阅消息信息失败:', err)
              }
            })
          } else {
            wx.showToast({
              title: '订阅消息开启成功',
              icon: 'success'
            })
          }
        }
      },
      fail: (err) => {
        console.error('开启订阅消息失败:', err)
      }
    })
  },

  /**
   * 发送订阅消息（测试用，实际应该由后端定时任务发送）
   * 参考文档：https://developers.weixin.qq.com/miniprogram/dev/OpenApiDoc/mp-message-management/subscribe-message/sendMessage.html
   */
  sendSubscribeMessage(e) {
    const token = app.globalData.token || wx.getStorageSync('token')
    if (!token) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      })
      return
    }

    wx.request({
      url: config.baseURL + config.api.subscribeSend,
      method: 'POST',
      header: {
        'Authorization': 'Bearer ' + token
      },
      data: {
        templateId: SUBSCRIBE_TEMPLATE_ID
      },
      success: (res) => {
        if (res.data && res.data.code === 0) {
          wx.showModal({
            title: '发送成功',
            content: '请返回微信主界面查看订阅消息',
            showCancel: false,
          })
          wx.showToast({
            title: '订阅消息已发送，请返回微信主界面查看',
          })
        } else {
          wx.showToast({
            title: res.data?.msg || '发送失败',
            icon: 'none'
          })
        }
      },
      fail: (err) => {
        wx.showToast({
          icon: 'none',
          title: '调用失败',
        })
        console.error('发送订阅消息失败：', err)
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 返回上一页
   */
  goBack: function() {
    wx.navigateBack()
  },

  /**
   * 跳转到资料完善页面
   */
  goToProfile: function() {
    if (!this.data.login) {
      return
    }
    wx.navigateTo({
      url: '/pages/profile/profile'
    })
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
   * 退出登录
   */
  logout: function() {
    const that = this
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      cancelText: '取消',
      confirmText: '确定',
      success: function(res) {
        if (res.confirm) {
          // 清除本地存储
          wx.removeStorageSync('user')
          wx.removeStorageSync('token')
          wx.removeStorageSync('userId')
          
          // 清除全局数据
          app.globalData.userInfo = ''
          app.globalData.token = ''
          app.globalData.userId = ''
          app.globalData.login = false
          
          // 更新页面数据
          that.setData({
            login: false,
            userInfo: {
              avatarUrl: "/static/user2.png",
              nickName: '马上登录'
            },
            hasUserInfo: false
          })
          
          wx.showToast({
            title: '已退出登录',
            icon: 'success'
          })
          
          console.log('退出登录成功')
        }
      }
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // 页面显示时刷新登录状态
    const userInfo = wx.getStorageSync('user')
    const login = app.globalData.login || (userInfo ? true : false)
    this.setData({
      userInfo: userInfo || this.data.userInfo,
      login: login
    })
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
  onShareAppMessage: function () {

  }
})
