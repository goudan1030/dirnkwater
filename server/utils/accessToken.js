const axios = require('axios')

let accessToken = null
let expiresAt = 0

/**
 * 获取微信 access_token
 * 参考文档：https://developers.weixin.qq.com/miniprogram/dev/OpenApiDoc/mp-access-token/getAccessToken.html
 */
async function getAccessToken() {
  const now = Date.now()
  
  // 如果 token 未过期，直接返回
  if (accessToken && now < expiresAt) {
    return accessToken
  }

  const WX_APPID = process.env.WX_APPID
  const WX_SECRET = process.env.WX_SECRET

  if (!WX_APPID || !WX_SECRET) {
    throw new Error('微信 AppID 或 AppSecret 未配置')
  }

  try {
    const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${WX_APPID}&secret=${WX_SECRET}`
    const response = await axios.get(url)
    
    if (response.data.errcode) {
      throw new Error(`获取 access_token 失败: ${response.data.errmsg}`)
    }

    accessToken = response.data.access_token
    // 提前 5 分钟刷新，避免过期
    expiresAt = now + (response.data.expires_in - 300) * 1000

    console.log('微信 access_token 获取成功')
    return accessToken
  } catch (error) {
    console.error('获取 access_token 错误:', error)
    throw error
  }
}

/**
 * 刷新 access_token（强制重新获取）
 */
async function refreshAccessToken() {
  accessToken = null
  expiresAt = 0
  return await getAccessToken()
}

module.exports = {
  getAccessToken,
  refreshAccessToken
}

