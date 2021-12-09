const app = getApp()
const db = wx.cloud.database()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    newWater:0,
    array:[],
    water:0,
    login:false,
    userInfo: {
      avatarUrl:"/static/user2.png"
    },
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    db.collection('user').where({
      _openid: ""
    }).get().then(res=>{
      console.log(res);//查询成功并输出
      var that = this;
      this.setData({
        fromData:res.data
      });
      console.log(res.data);
    }).catch(err=>{
      console.log(err);
    })
    let login = app.globalData.login
    const userInfo = wx.getStorageSync('user')
    console.log('user');
    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true,
        userInfo:userInfo,
        login:login
      })
    }
  },
  /**
   * 当刷新按钮点击后，刷新数据；
   */
  reflash(){
    db.collection('user').where({
      _openid: ""
    }).get().then(res=>{
      console.log(res);//查询成功并输出
      var that = this;
      this.setData({
        fromData:res.data
      });
      console.log(res.data);
      wx.showToast({
        title: '刷新成功！',
      })
    }).catch(err=>{
      console.log(err);
    })
  },
   /**
   *清除数据按钮；
   */
  clear(){
    wx.showModal({
      title: '提示',
      content: '确定要清除今天的喝水数据吗？清除完成后请点击刷新按钮',
      cancelText: '取消',
      confirmText: '确定',
      success: function(res) {
        if(res.cancel){
        //这个跳转是左边按钮的跳转链接
        }else{
        //这里是右边按钮的跳转链接
        db.collection('user').where({
          _openid: ""
        }).get().then(res=>{
          console.log(res);
          var that=this
          var newWater = 0
          console.log('newWater:',newWater);
          db.collection('user').where({
            _openid: ""
          }).update({
            data:{
              water:newWater
            }
          }).then(res=>{
            wx.showToast({
              title: '清除成功',
            })
            console.log(res);
          })
        })  
        }
      }
    })
  },
    /**
   * 第一个喝水按钮；
   */
  getDrink1(){
    const userInfo = wx.getStorageSync('user')
    if(userInfo){
      db.collection('user').where({
        _openid: ""
      }).get().then(res=>{
        console.log(res);
        var that=this
        var newWater = res.data[0].water+250
        console.log('newWater:',newWater);
        db.collection('user').where({
          _openid: ""
        }).update({
          data:{
            water:newWater
          }
        }).then(res=>{
          wx.showToast({
            title: '记录成功！',
          })
          console.log(res);
          db.collection('user').where({
            _openid: ""
          }).get().then(res=>{
            console.log(res);//查询成功并输出
            
            var that = this;
            this.setData({
              fromData:res.data
            });
            console.log("最后的喝水结果res.data",res.data[0].water);
            if(res.data[0].water>1500 && res.data[0].water<4500){
              wx.showModal({
                title: '恭喜',
                content: '你已经完成了今天的喝水目标了哦～',
                cancelText: '下次吧',
                confirmText: '马上分享',
                success: function(res) {
                  if(res.cancel){
                  //这个跳转是左边按钮的跳转链接
                  }else{
                  //这里是右边按钮的跳转链接
                  }
                }
              })
            }else if(res.data[0].water>4500){
              wx.showModal({
                title: '提示',
                content: '请勿过多饮水避免水中毒！',
                cancelText: '取消',
                confirmText: '好的',
                success: function(res) {
                  if(res.cancel){
                  //这个跳转是左边按钮的跳转链接
                  }else{
                  //这里是右边按钮的跳转链接
                  }
                }
              })
            }
          }).catch(err=>{
            console.log(err);
          })
        })
      })  
    }else{
      console.log('用户还没有登录呢');
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
    }

  },
      /**
   * 第二个喝水按钮；
   */
  getDrink2(){
    db.collection('user').where({
      _openid: ""
    }).get().then(res=>{
      console.log(res);
      var that=this
      var newWater = res.data[0].water+350
      console.log('newWater:',newWater);
      db.collection('user').where({
        _openid: ""
      }).update({
        data:{
          water:newWater
        }
      }).then(res=>{
        wx.showToast({
          title: '记录成功！',
        })
        console.log(res);
        db.collection('user').where({
          _openid: ""
        }).get().then(res=>{
          console.log(res);//查询成功并输出
          var that = this;
          this.setData({
            fromData:res.data
          });
          console.log(res.data);
          if(res.data[0].water>1500 && res.data[0].water<4500){
            wx.showModal({
              title: '恭喜',
              content: '你已经完成了今天的喝水目标了哦～',
              cancelText: '下次吧',
              confirmText: '马上分享',
              success: function(res) {
                if(res.cancel){
                //这个跳转是左边按钮的跳转链接
                }else{
                //这里是右边按钮的跳转链接
                }
              }
            })
          }else if(res.data[0].water>4500){
            wx.showModal({
              title: '提示',
              content: '请勿过多饮水避免水中毒！',
              cancelText: '取消',
              confirmText: '好的',
              success: function(res) {
                if(res.cancel){
                //这个跳转是左边按钮的跳转链接
                }else{
                //这里是右边按钮的跳转链接
                }
              }
            })
          }
        }).catch(err=>{
          console.log(err);
        })
      })
    })  

  },
        /**
   * 第三个喝水按钮；
   */
  getDrink3(){
    db.collection('user').where({
      _openid: ""
    }).get().then(res=>{
      console.log(res);
      var that=this
      var newWater = res.data[0].water+500
      console.log('newWater:',newWater);
      db.collection('user').where({
        _openid: ""
      }).update({
        data:{
          water:newWater
        }
      }).then(res=>{
        wx.showToast({
          title: '记录成功！',
        })
        console.log(res);
        db.collection('user').where({
          _openid: ""
        }).get().then(res=>{
          console.log(res);//查询成功并输出
          var that = this;
          this.setData({
            fromData:res.data
          });
          console.log(res.data);
          if(res.data[0].water>1500 && res.data[0].water<4500){
            wx.showModal({
              title: '恭喜',
              content: '你已经完成了今天的喝水目标了哦～',
              cancelText: '下次吧',
              confirmText: '马上分享',
              success: function(res) {
                if(res.cancel){
                //这个跳转是左边按钮的跳转链接
                }else{
                //这里是右边按钮的跳转链接
                }
              }
            })
          }else if(res.data[0].water>4500){
            wx.showModal({
              title: '提示',
              content: '请勿过多饮水避免水中毒！',
              cancelText: '取消',
              confirmText: '好的',
              success: function(res) {
                if(res.cancel){
                //这个跳转是左边按钮的跳转链接
                }else{
                //这里是右边按钮的跳转链接
                }
              }
            })
          }
        }).catch(err=>{
          console.log(err);
        })
      })
    })  

  },
        /**
   * 第四个喝水按钮；
   */
  getDrink4(){
    db.collection('user').where({
      _openid: ""
    }).get().then(res=>{
      console.log(res);
      var that=this
      var newWater = res.data[0].water+1000
      console.log('newWater:',newWater);
      db.collection('user').where({
        _openid: ""
      }).update({
        data:{
          water:newWater
        }
      }).then(res=>{
        wx.showToast({
          title: '记录成功！',
        })
        console.log(res);
        db.collection('user').where({
          _openid: ""
        }).get().then(res=>{
          console.log(res);//查询成功并输出
          var that = this;
          this.setData({
            fromData:res.data
          });
          console.log(res.data);
          if(res.data[0].water>1500 && res.data[0].water<4500){
            wx.showModal({
              title: '恭喜',
              content: '你已经完成了今天的喝水目标了哦～',
              cancelText: '下次吧',
              confirmText: '马上分享',
              success: function(res) {
                if(res.cancel){
                //这个跳转是左边按钮的跳转链接
                }else{
                //这里是右边按钮的跳转链接
                }
              }
            })
          }else if(res.data[0].water>4500){
            wx.showModal({
              title: '提示',
              content: '请勿过多饮水避免水中毒！',
              cancelText: '取消',
              confirmText: '好的',
              success: function(res) {
                if(res.cancel){
                //这个跳转是左边按钮的跳转链接
                }else{
                //这里是右边按钮的跳转链接
                }
              }
            })
          }
        }).catch(err=>{
          console.log(err);
        })
      })
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