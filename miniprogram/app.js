const config = require('./config.js')

App({
  onLaunch: function() {
    // 从本地存储恢复用户信息
    const userInfo = wx.getStorageSync('user')
    const token = wx.getStorageSync('token')
    if(userInfo){
      this.globalData.userInfo = userInfo
      this.globalData.login = true
    } else {
      console.log('no userInfo')
    }
    if(token) {
      this.globalData.token = token
    }
    
    // 执行登录，获取 token
    this.doLogin()
  },
  
  /**
   * 登录获取 token
   */
  doLogin: function() {
    wx.login({
      success: (res) => {
        if (res.code) {
          // 调用后端登录接口
          wx.request({
            url: config.baseURL + config.api.login,
            method: 'POST',
            data: {
              code: res.code
            },
            success: (result) => {
              if (result.data && result.data.code === 0) {
                const token = result.data.data.token
                const userId = result.data.data.userId
                this.globalData.token = token
                this.globalData.userId = userId
                wx.setStorageSync('token', token)
                wx.setStorageSync('userId', userId)
                console.log('登录成功，token:', token)
              } else {
                console.error('登录失败:', result.data)
              }
            },
            fail: (err) => {
              console.error('登录请求失败:', err)
            }
          })
        } else {
          console.error('获取 code 失败:', res.errMsg)
        }
      },
      fail: (err) => {
        console.error('wx.login 失败:', err)
      }
    })
  },
  
  globalData: {
    userInfo: '',
    token: '',
    userId: '',
    login: false
  }
})
