
App({
  onLaunch: function() {
    const userInfo = wx.getStorageSync('user')
    if(userInfo){
      this.globalData.userInfo = userInfo,
      this.globalData.login = true
    }else{
      console.log('no userInfo');
    }
    if(!wx.cloud){
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else{
      wx.cloud.init({
        env: 'water-9gzqy0q4226ed08e',
        traceUser: true
      })
    }
 },
 globalData: {
    userInfo: '',
    openId: '',
 }
})
