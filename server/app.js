const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
require('dotenv').config()
const { connectDB } = require('./db')

// 连接数据库
connectDB()

const app = express()

// 中间件
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// 引入路由
const authRoutes = require('./routes/auth')
const userRoutes = require('./routes/user')
const waterRoutes = require('./routes/water')

// 路由
app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/water', waterRoutes)

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'API is running' })
})

// 错误处理
app.use((err, req, res, next) => {
  console.error('Error:', err)
  res.status(500).json({
    code: -1,
    msg: '服务器内部错误',
    data: null
  })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`)
  console.log(`健康检查: http://localhost:${PORT}/health`)
})

