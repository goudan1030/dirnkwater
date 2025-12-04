const app = getApp()
const config = require('../../config.js')

const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'

Page({
  /**
   * 页面的初始数据
   */
  data: {
    avatarUrl: defaultAvatarUrl,
    nickName: '',
    originalAvatarUrl: '',
    originalNickName: '',
    isSaving: false,
    hasChanged: false,
    statusBarHeight: 0,
    navBarHeight: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获取系统信息，设置导航栏高度
    const systemInfo = wx.getSystemInfoSync()
    const statusBarHeight = systemInfo.statusBarHeight || 0
    const navBarHeight = statusBarHeight + 44 // 44 是导航栏内容高度（px）
    
    this.setData({
      statusBarHeight: statusBarHeight,
      navBarHeight: navBarHeight
    })
    
    this.loadUserInfo()
  },

  /**
   * 返回上一页
   */
  goBack: function() {
    wx.navigateBack()
  },

  /**
   * 加载用户信息
   */
  loadUserInfo: function() {
    const userInfo = wx.getStorageSync('user') || app.globalData.userInfo
    const avatarUrl = userInfo?.avatarUrl || defaultAvatarUrl
    const nickName = userInfo?.nickName || ''

    this.setData({
      avatarUrl: avatarUrl,
      nickName: nickName,
      originalAvatarUrl: avatarUrl,
      originalNickName: nickName
    })
  },

  /**
   * 选择头像
   */
  onChooseAvatar: function(e) {
    const { avatarUrl } = e.detail
    console.log('选择头像:', avatarUrl)
    
    // 检查头像是否符合安全要求
    if (!avatarUrl) {
      wx.showToast({
        title: '头像选择失败',
        icon: 'none'
      })
      return
    }

    this.setData({
      avatarUrl: avatarUrl,
      hasChanged: true
    })

    wx.showToast({
      title: '头像已更新',
      icon: 'success',
      duration: 1500
    })
  },

  /**
   * 昵称输入
   */
  onNickNameInput: function(e) {
    const value = e.detail.value
    this.setData({
      nickName: value,
      hasChanged: true
    })
  },

  /**
   * 昵称失焦（微信会进行安全检测）
   */
  onNickNameBlur: function(e) {
    const value = e.detail.value
    // 如果微信安全检测清空了内容，这里会收到空值
    if (!value && this.data.originalNickName) {
      wx.showToast({
        title: '昵称不符合规范',
        icon: 'none'
      })
      // 恢复原昵称
      this.setData({
        nickName: this.data.originalNickName
      })
    }
  },

  /**
   * 保存资料
   */
  saveProfile: function() {
    const { avatarUrl, nickName, isSaving } = this.data

    if (isSaving) {
      return
    }

    // 验证昵称
    if (!nickName || nickName.trim() === '') {
      wx.showToast({
        title: '请输入昵称',
        icon: 'none'
      })
      return
    }

    if (nickName.length > 20) {
      wx.showToast({
        title: '昵称最多20个字符',
        icon: 'none'
      })
      return
    }

    const token = app.globalData.token || wx.getStorageSync('token')
    if (!token) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      })
      // 尝试登录
      app.doLogin()
      setTimeout(() => {
        this.saveProfile()
      }, 1000)
      return
    }

    this.setData({
      isSaving: true
    })

    // 先上传头像到服务器（如果需要），这里暂时直接使用本地路径
    // 实际项目中，应该将头像上传到服务器或云存储
    this.uploadAvatar(avatarUrl).then((avatarUrlFinal) => {
      // 更新用户资料到服务器
      wx.request({
        url: config.baseURL + config.api.updateProfile,
        method: 'POST',
        header: {
          'Authorization': 'Bearer ' + token
        },
        data: {
          nickName: nickName.trim(),
          avatarUrl: avatarUrlFinal || avatarUrl
        },
        success: (res) => {
          if (res.data && res.data.code === 0) {
            // 更新本地存储
            const userInfo = {
              nickName: nickName.trim(),
              avatarUrl: avatarUrlFinal || avatarUrl
            }
            wx.setStorageSync('user', userInfo)
            app.globalData.userInfo = userInfo

            // 更新原始数据
            this.setData({
              originalAvatarUrl: avatarUrlFinal || avatarUrl,
              originalNickName: nickName.trim(),
              hasChanged: false
            })

            wx.showToast({
              title: '保存成功',
              icon: 'success'
            })

            // 延迟返回上一页，让用户看到成功提示
            setTimeout(() => {
              // 获取页面栈，触发上一页的刷新
              const pages = getCurrentPages()
              const prevPage = pages[pages.length - 2]
              if (prevPage && prevPage.onShow) {
                // 返回后会自动触发上一页的 onShow，刷新数据
              }
              wx.navigateBack()
            }, 1500)
          } else {
            wx.showToast({
              title: res.data?.msg || '保存失败',
              icon: 'none'
            })
          }
        },
        fail: (err) => {
          console.error('保存失败:', err)
          wx.showToast({
            title: '网络错误，请重试',
            icon: 'none'
          })
        },
        complete: () => {
          this.setData({
            isSaving: false
          })
        }
      })
    }).catch((err) => {
      console.error('头像上传失败:', err)
      // 即使上传失败，也继续保存其他信息
      this.setData({
        isSaving: false
      })
    })
  },

  /**
   * 上传头像（如果需要）
   * 注意：这里简化处理，实际项目中应该将头像上传到服务器或云存储
   */
  uploadAvatar: function(avatarUrl) {
    return new Promise((resolve, reject) => {
      // 如果头像已经是网络地址，直接返回
      if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://')) {
        resolve(avatarUrl)
        return
      }

      // 如果是本地临时路径，需要上传到服务器
      // 这里简化处理，实际项目中应该实现上传逻辑
      // 例如：上传到云存储或自己的服务器
      
      // 临时处理：将本地路径转换为可用的路径
      // 实际项目中，应该调用云存储或服务器上传接口
      console.log('头像为本地路径，需要上传:', avatarUrl)
      
      // 这里暂时直接返回本地路径
      // 在生产环境中，应该将图片上传到服务器或云存储
      resolve(avatarUrl)
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
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
    
  }
})

