const express = require('express')
const axios = require('axios')
const router = express.Router()
const { User } = require('../models/User')
const { generateToken } = require('../utils/jwt')

const WX_APPID = process.env.WX_APPID
const WX_SECRET = process.env.WX_SECRET

/**
 * POST /api/auth/login
 * 小程序登录，通过 code 获取 openid，返回 token
 */
router.post('/login', async (req, res) => {
  try {
    const { code } = req.body

    if (!code) {
      return res.json({
        code: 400,
        msg: '缺少 code 参数',
        data: null
      })
    }

    // 调用微信接口获取 openid
    const wxUrl = `https://api.weixin.qq.com/sns/jscode2session?appid=${WX_APPID}&secret=${WX_SECRET}&js_code=${code}&grant_type=authorization_code`
    
    const wxResponse = await axios.get(wxUrl)
    const { openid, session_key, errcode, errmsg } = wxResponse.data

    if (errcode) {
      return res.json({
        code: 400,
        msg: `微信登录失败: ${errmsg}`,
        data: null
      })
    }

    if (!openid) {
      return res.json({
        code: 400,
        msg: '获取 openid 失败',
        data: null
      })
    }

    // 查找或创建用户
    const user = await User.findOrCreate(openid)

    // 生成 token
    const token = generateToken(user.id.toString(), openid)

    res.json({
      code: 0,
      msg: '登录成功',
      data: {
        token,
        userId: user.id.toString(),
        openid: user.openid
      }
    })
  } catch (error) {
    console.error('登录错误:', error)
    res.json({
      code: 500,
      msg: '服务器错误',
      data: null
    })
  }
})

module.exports = router

