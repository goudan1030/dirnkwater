const cloud = require('wx-server-sdk');
cloud.init();
const db = cloud.database();

exports.main = async (event, context) => {
  // 向 course-message 集合库中写入相关数据
  try {
    const { OPENID } = cloud.getWXContext();
    const result = await db.collection('message').add({
      data: {
        touser: OPENID, // 订阅者的openid
        page: 'index/index', // 订阅消息卡片点击后会打开小程序的哪个页面，注意这里的界面是线下小程序有的，否则跳不过去
        data: {
          thing1: {
          value: '喝水啦～'
        },
        thing3: {
          value: '每天摄入1500-2500ml'
        },
        thing8: {
          value: '提醒喝水小助手来提醒你喝水啦～快拿起杯子吨吨吨吧～'
        }
        },
        templateId: event.templateId, // 订阅消息模板ID
        isSend: false, // 消息发送状态设置为 false
      },
    });
    return result;
  } catch (err) {
    console.log(err);
    return err;
  }
};