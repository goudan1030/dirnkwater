const express = require('express')
const router = express.Router()
const { User } = require('../models/User')
const { authenticateToken } = require('../utils/jwt')

/**
 * POST /api/user/profile
 * 更新用户资料
 */
router.post('/profile', authenticateToken, async (req, res) => {
  try {
    const { nickName, avatarUrl } = req.body
    const userId = req.user.userId

    const user = await User.findById(userId)
    if (!user) {
      return res.json({
        code: 404,
        msg: '用户不存在',
        data: null
      })
    }

    // 更新用户信息
    const updatedUser = await User.update(userId, { nickName, avatarUrl })

    res.json({
      code: 0,
      msg: '更新成功',
      data: {
        userId: updatedUser.id.toString(),
        nickName: updatedUser.nickName,
        avatarUrl: updatedUser.avatarUrl
      }
    })
  } catch (error) {
    console.error('更新用户资料错误:', error)
    res.json({
      code: 500,
      msg: '服务器错误',
      data: null
    })
  }
})

/**
 * GET /api/user/profile
 * 获取用户资料
 */
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId

    const user = await User.findById(userId)
    if (!user) {
      return res.json({
        code: 404,
        msg: '用户不存在',
        data: null
      })
    }

    res.json({
      code: 0,
      msg: '获取成功',
      data: {
        userId: user.id.toString(),
        nickName: user.nickName,
        avatarUrl: user.avatarUrl,
        openid: user.openid
      }
    })
  } catch (error) {
    console.error('获取用户资料错误:', error)
    res.json({
      code: 500,
      msg: '服务器错误',
      data: null
    })
  }
})

module.exports = router

