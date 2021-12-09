const cloud = require('wx-server-sdk')
cloud.init()
exports.main = async (event, context) => {
    const wxContext = cloud.getWXContext()
    return {
        event,
        _openid: wxContext._openid,
        appid: wxContext.APPID,
        unionid: wxContext.UNIONID,
    }
}