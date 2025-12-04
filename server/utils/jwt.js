const jwt = require('jsonwebtoken')
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

/**
 * 生成 JWT token
 */
function generateToken(userId, openid) {
  return jwt.sign(
    { userId, openid },
    JWT_SECRET,
    { expiresIn: '30d' } // 30天过期
  )
}

/**
 * 验证 JWT token
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (err) {
    return null
  }
}

/**
 * 从请求头中提取 token
 */
function extractToken(req) {
  const authHeader = req.headers.authorization
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }
  return null
}

/**
 * 中间件：验证 token
 */
function authenticateToken(req, res, next) {
  const token = extractToken(req)
  
  if (!token) {
    return res.json({
      code: 401,
      msg: '未提供 token',
      data: null
    })
  }

  const decoded = verifyToken(token)
  if (!decoded) {
    return res.json({
      code: 401,
      msg: 'token 无效或已过期',
      data: null
    })
  }

  req.user = decoded
  next()
}

module.exports = {
  generateToken,
  verifyToken,
  extractToken,
  authenticateToken
}

