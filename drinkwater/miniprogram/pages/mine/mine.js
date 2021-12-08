const SUBSCRIBE_ID = 'pT3MZV9Z7N0wYpTCFLMJaWbNxE7u44wAsD0N-H3jHlU'  // 下发的模板ID
const app = getApp()
const db = wx.cloud.database()
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
    // const userInfo = app.globalData.userInfo
    let login = app.globalData.login
    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true,
        userInfo:userInfo,
        login:login
      })
    }
  },
   /**
   * 获取用户登录信息
   */
getUserProfile(){
  var that = this;
  let userInfo = that.data.userInfo
  wx.getUserProfile({
    desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
    success: (res) => {
      console.log('用户资料',res.userInfo);
      this.setData({
        userInfo : res.userInfo,
        login:true
      })
      wx.setStorageSync('user', res.userInfo)
      db.collection('user').where({
        nickName:res.userInfo.nickName
      }).get({
        success:res=>{
          if(res.data.length == 0){
            var userInfo = that.data.userInfo
            db.collection('user').add({
              data:{
                nickName: userInfo.nickName,
                avatarUrl: userInfo.avatarUrl,
                time: new Date(),
                water:0

              },success:res=>{
                wx.showToast({
                  title: '登录成功',
                  icon:'success'
                })
                console.log('用户信息已经保存到数据库',res);
              },fail:err=>{
                console.log('用户信息保存失败！',err);
              }
            })
          }else{
            console.log('已经记录过！');
          }
        }
      })
      console.log(res.userInfo);
      this.setData({
        userInfo: res.userInfo,
        avatarUrl:res.userInfo.avatarUrl,
        hasUserInfo: true
      })
    }
  })
},
  /**
   * 用户订阅消息
   */
  sub(e){
        // 获取课程相关信息
        wx.requestSubscribeMessage({
          tmplIds: [SUBSCRIBE_ID],
          success(res) {
            if (res[SUBSCRIBE_ID] === 'accept') {
              // 调用云函数subscribe
              wx.cloud
                .callFunction({
                  name: 'addMsg',
                  data: {
                    
                    templateId: SUBSCRIBE_ID,
                  },
                })
                .then(() => {
                  wx.showToast({
                    title: '订阅成功',
                    icon: 'success'
                  });
                })
                .catch(() => {
                  // dothing...
                });
            }
          },
        });
  },
   //发送消息
   sendSubscribeMessage(e) {
    //调用云函数，
    wx.cloud.callFunction({
      name: 'sendMsgSubscribe',
      //data是用来传给云函数event的数据，你可以把你当前页面获取消息填写到服务通知里面
      data: {
        action: 'sendSubscribeMessage',
        templateId: 'pT3MZV9Z7N0wYpTCFLMJaWbNxE7u44wAsD0N-H3jHlU',//这里我就直接把模板ID传给云函数了

        _openid:''//填入自己的openid
      },
      success: res => {
        console.warn('[云函数] [openapi] subscribeMessage.send 调用成功：', res)
        wx.showModal({
          title: '发送成功',
          content: '请返回微信主界面查看',
          showCancel: false,
        })
        wx.showToast({
          title: '发送成功，请返回微信主界面查看',
        })
        this.setData({
          subscribeMessageResult: JSON.stringify(res.result)
        })
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '调用失败',
        })
        console.error('[云函数] [openapi] subscribeMessage.send 调用失败：', err)
      }
    })
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