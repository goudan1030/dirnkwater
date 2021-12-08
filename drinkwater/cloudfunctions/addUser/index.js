const cloud = require('wx-server-sdk');
cloud.init();
const db = cloud.database();

exports.main = async (event, context) => {
  // 向 user 集合库中写入相关数据
  try {
    const { OPENID } = cloud.getWXContext();
    const result = await db.collection('user').add({
      data: {
        touuser:OPENID,
        data:event.data,
        avatarUrl:res.userInfo.avatarUrl,
        nickName:res.userInfo.nickName,
        drinkwater:0
      },
    });
    return result;
  } catch (err) {
    console.log(err);
    return err;
  }
};