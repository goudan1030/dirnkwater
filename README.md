# 提醒喝水微信小程序

一个功能完整的喝水提醒微信小程序，帮助用户养成健康饮水习惯。

![喝水](https://user-images.githubusercontent.com/72783438/145314592-7ed28da9-2263-4f2d-98a6-5ebe6cd528c7.jpg)

更多好玩有趣的开源小程序，欢迎来我的网站：https://www.minifans.cn/

## 功能特性

✨ **核心功能**
- 📊 实时记录每日喝水量，可视化显示进度
- 🎯 自定义每日喝水目标（默认 1500ml）
- 📝 详细的喝水记录历史
- 🔄 支持多种喝水容量（250ml/350ml/500ml/1000ml）

⏰ **闹钟提醒**
- 支持添加多个喝水提醒闹钟
- 三种重复模式：每天、工作日、仅一次
- 定时自动发送订阅消息提醒

👤 **用户系统**
- 微信一键登录
- 用户资料管理（昵称、头像）
- 数据云端同步

📱 **订阅消息**
- 基于微信订阅消息 API
- 定时推送喝水提醒
- 支持自定义提醒内容

## 技术栈

**前端**
- 微信小程序原生开发
- Skyline 渲染引擎

**后端**
- Node.js + Express
- MySQL 数据库
- JWT 身份认证
- node-cron 定时任务调度

## 项目结构

```
dirnkwater/
├── miniprogram/          # 小程序前端代码
│   ├── pages/           # 页面
│   │   ├── index/       # 首页（喝水记录）
│   │   ├── mine/        # 我的页面
│   │   ├── profile/     # 资料编辑
│   │   └── alarm/       # 闹钟管理
│   ├── components/      # 组件
│   ├── utils/          # 工具函数
│   └── config.js       # 配置文件
│
└── server/              # 后端服务
    ├── routes/         # 路由
    │   ├── auth.js     # 认证
    │   ├── user.js     # 用户
    │   ├── water.js    # 喝水记录
    │   ├── alarm.js    # 闹钟
    │   └── subscribe.js # 订阅消息
    ├── models/         # 数据模型
    ├── utils/          # 工具函数
    │   ├── scheduler.js # 定时任务调度器
    │   └── accessToken.js # 微信 access_token
    └── app.js          # 应用入口
```

## 快速开始

### 前置要求

- Node.js >= 14.0.0（推荐 16.x 或 18.x）
- MySQL >= 5.7 或 >= 8.0
- 微信小程序开发工具
- 微信小程序账号（AppID 和 AppSecret）

### 后端部署

详细的后端部署说明请查看 [server/README.md](./server/README.md)

**快速安装：**

```bash
cd server
npm install
cp env.example .env
# 编辑 .env 文件，填入配置信息
npm start
```

### 小程序配置

1. 克隆项目到本地
2. 使用微信开发者工具打开 `miniprogram` 目录
3. 修改 `miniprogram/config.js` 中的 `baseURL` 为你的后端 API 地址
4. 在微信公众平台配置服务器域名

## 主要功能说明

### 喝水记录

- 支持快速添加常见容量的水（250ml/350ml/500ml/1000ml）
- 实时显示今日已喝水量和目标完成度
- 数据自动同步到云端

### 闹钟管理

- 添加多个自定义时间的喝水提醒
- 支持每天、工作日、仅一次三种重复模式
- 到点自动发送微信订阅消息

### 订阅消息

- 基于微信订阅消息 API，无需用户常驻小程序
- 定时任务每分钟检查到期闹钟并自动发送
- 提醒内容可自定义

## 更新日志

### 2024.12.04

- ✨ 新增闹钟管理功能，支持多种重复模式
- ✨ 新增用户资料编辑页面
- ✨ 实现定时订阅消息推送功能
- ✨ 新增退出登录功能
- 🐛 修复导航动画问题
- 🐛 修复 JSON 解析错误
- 🐛 修复 SQL 语法错误（repeat 关键字）

### 2022.06.02

- 新增喝水闹钟功能
- 修复订阅消息推送时间不准确的问题
- 修改闹钟时间排序的问题

## 开发说明

### 环境变量配置

后端需要在 `server/.env` 文件中配置：

```env
# 微信小程序配置
WX_APPID=你的小程序AppID
WX_SECRET=你的小程序Secret

# 数据库配置
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=数据库用户名
MYSQL_PASSWORD=数据库密码
MYSQL_DATABASE=数据库名

# JWT 配置
JWT_SECRET=随机密钥
JWT_EXPIRES_IN=30d

# 订阅消息配置
SUBSCRIBE_TEMPLATE_ID=订阅消息模板ID
MINIPROGRAM_STATE=developer  # developer/formal/trial
```

### 数据库表结构

项目会自动创建以下数据表：
- `users` - 用户信息表
- `water_records` - 喝水记录表
- `alarms` - 闹钟表

## 部署

### 服务器部署

推荐使用 PM2 管理 Node.js 进程，详细部署步骤请参考 [server/README.md](./server/README.md)

### Git 部署

服务器代码已支持 Git 部署，可以直接 `git pull` 更新代码。

## 参考文档

- [微信小程序开发文档](https://developers.weixin.qq.com/miniprogram/dev/framework/)
- [订阅消息文档](https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/subscribe-message.html)
- [Node.js 文档](https://nodejs.org/)
- [Express 文档](https://expressjs.com/)

## License

MIT
