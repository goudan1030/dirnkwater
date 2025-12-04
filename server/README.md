# 喝水提醒小程序后端 API

## ⚠️ 重要提示

**如果你的服务器还没有安装 Node.js 和 MySQL，请先查看 [安装指南](./INSTALL.md)**

## 环境要求

- Node.js >= 14.0.0（推荐 16.x 或 18.x）
- MySQL >= 5.7 或 >= 8.0（或 MariaDB >= 10.x）
- npm（随 Node.js 一起安装）

## 安装步骤

1. **安装依赖**
```bash
cd server
npm install
```

2. **配置环境变量**
```bash
cp .env.example .env
```

编辑 `.env` 文件，填入：
- `WX_APPID`: 你的小程序 AppID（在微信公众平台获取）
- `WX_SECRET`: 你的小程序 AppSecret
- `JWT_SECRET`: 一个随机字符串，用于 JWT 加密（建议使用长随机字符串）
- `MYSQL_HOST`: MySQL 主机地址（默认 localhost）
- `MYSQL_PORT`: MySQL 端口（默认 3306）
- `MYSQL_USER`: MySQL 用户名
- `MYSQL_PASSWORD`: MySQL 密码
- `MYSQL_DATABASE`: 数据库名称

3. **启动服务器**
```bash
# 开发模式（自动重启）
npm run dev

# 生产模式
npm start
```

服务器默认运行在 `http://localhost:3000`

## API 接口说明

### 1. 登录接口
- **POST** `/api/auth/login`
- **参数**: `{ code: "微信登录code" }`
- **返回**: `{ code: 0, data: { token, userId, openid } }`

### 2. 更新用户资料
- **POST** `/api/user/profile`
- **Header**: `Authorization: Bearer {token}`
- **参数**: `{ nickName: "昵称", avatarUrl: "头像URL" }`

### 3. 获取今天喝水量
- **GET** `/api/water/today`
- **Header**: `Authorization: Bearer {token}`
- **返回**: `{ code: 0, data: { water: 500 } }`

### 4. 增加喝水记录
- **POST** `/api/water/add`
- **Header**: `Authorization: Bearer {token}`
- **参数**: `{ amount: 250 }` (250/350/500/1000)
- **返回**: `{ code: 0, data: { water: 750 } }`

### 5. 清空今天喝水量
- **POST** `/api/water/clear`
- **Header**: `Authorization: Bearer {token}`
- **返回**: `{ code: 0, data: { water: 0 } }`

## 部署到服务器（宝塔面板 - 最简单方式）

### 方式一：宝塔面板创建 PM2 项目（推荐）

1. **上传代码到服务器**
   - 将 `server` 目录下的所有文件上传到服务器
   - 建议上传到：`/www/wwwroot/drinkwater-api`（或你自定义的目录）

2. **在宝塔面板创建 PM2 项目**
   - 进入宝塔面板 → 点击「网站」标签页
   - 点击顶部标签栏的「Node项目」
   - 点击绿色的「添加站点」按钮
   - 在弹出的「添加Node项目」对话框中，选择「PM2项目」标签页
   - 填写以下配置：

     **必填项：**
     - **项目名称**：填写 `drinkwater-api`（或自定义名称）
     - **Node版本**：选择 Node.js 版本（建议选择 **v16.9.0** 或更高版本）
     - **启动文件**：点击文件夹图标，选择 `app.js`（位于项目根目录）
     - **运行目录**：点击文件夹图标，选择项目根目录 `/www/wwwroot/drinkwater-api`
     - **负载实例数量**：填写 `1`（单实例即可，如需高可用可增加）
     - **内存上限**：填写 `1024`（单位 MB，根据服务器内存调整）

     **可选项：**
     - **自动重载**：建议开启（代码更新后自动重启）
     - **包管理器**：选择 `npm`（或 `pnpm`、`yarn`，根据你的 package.json）
     - **不安装node_module**：如果已安装依赖，可以勾选

   - 点击「确定」创建项目

3. **安装依赖（如果未安装）**
   - 项目创建后，如果未勾选「不安装node_module」，宝塔会自动安装依赖
   - 如果已勾选，需要手动安装：
     - 在项目列表中，找到 `drinkwater-api` 项目
     - 点击「终端」或通过 SSH 进入项目目录：
       ```bash
       cd /www/wwwroot/drinkwater-api
       npm install
       ```

4. **配置环境变量**
   - 在项目目录（`/www/wwwroot/drinkwater-api`）中创建 `.env` 文件
   - 可以通过宝塔文件管理器创建，或使用 SSH 命令：
     ```bash
     cd /www/wwwroot/drinkwater-api
     nano .env
     ```
   - 填入以下内容：
     ```
     PORT=3000
     WX_APPID=你的小程序AppID
     WX_SECRET=你的小程序AppSecret
     JWT_SECRET=随机生成的长字符串（建议32位以上）
     MYSQL_HOST=localhost
     MYSQL_PORT=3306
     MYSQL_USER=drink
     MYSQL_PASSWORD=你的数据库密码
     MYSQL_DATABASE=drink
     MYSQL_CHARSET=utf8mb4
     ```
   - 保存文件

5. **配置域名和 SSL 证书**
   - 在「网站」→「Node项目」中找到刚创建的项目
   - 点击项目右侧的「设置」
   - 在「域名管理」中添加域名：`drink.loner.cc`
   - 在「SSL」标签页中，选择「Let's Encrypt」，点击「申请」
   - 宝塔会自动配置 HTTPS 和证书续期

6. **配置反向代理（重要）**
   - 由于接口路径是 `/api/*`，需要在 Nginx 配置中添加反向代理
   - 在项目设置中，点击「配置文件」或「Nginx配置」
   - 在 `location /` 块中添加：
     ```nginx
     location /api {
         proxy_pass http://localhost:3000;
         proxy_set_header Host $host;
         proxy_set_header X-Real-IP $remote_addr;
         proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
         proxy_set_header X-Forwarded-Proto $scheme;
     }
     ```
   - 保存配置并重载 Nginx

7. **启动 PM2 项目**
   - 在项目列表中，找到 `drinkwater-api` 项目
   - 点击「启动」按钮（PM2 会自动管理进程）
   - 如果显示「停止」，说明已启动
   - 可以点击「重启」确保项目运行
   - 可以点击「日志」查看运行日志

8. **PM2 管理功能**
   - **查看状态**：在项目列表中可以看到运行状态（运行中/已停止）
   - **查看日志**：点击「日志」按钮查看实时日志
   - **重启项目**：点击「重启」按钮
   - **停止项目**：点击「停止」按钮
   - **内存监控**：PM2 会自动监控内存使用，超过上限会自动重启

9. **测试接口**
   - 访问：`https://drink.loner.cc/api/health`
   - 应该返回：`{"status":"ok","message":"API is running"}`
   - 如果返回 404，检查反向代理配置是否正确
   - 如果返回 500，查看 PM2 日志排查错误

### 方式二：使用 PM2 管理器插件（备选方案）

如果「Node项目」中的 PM2 项目方式不可用，可以使用独立的 PM2 管理器插件：

1. **安装 PM2 管理器**
   - 在宝塔面板「软件商店」搜索「PM2 管理器」，安装

2. **添加项目**
   - 打开 PM2 管理器
   - 点击「添加项目」
   - 项目名称：`drinkwater-api`
   - 项目路径：选择 `/www/wwwroot/drinkwater-api` 目录
   - 启动文件：`app.js`
   - Node 版本：选择 16.x 或 18.x
   - 点击「提交」

3. **配置环境变量**
   - 在 PM2 管理器中，找到项目 →「环境变量」
   - 添加环境变量（参考 env.example）

4. **配置域名和 SSL**
   - 在「网站」中创建网站 `drink.loner.cc`
   - 配置反向代理到 `http://localhost:3000`
   - 申请 SSL 证书

## 数据库结构

### users 表
- `id`: 主键（自增）
- `openid`: 微信 openid（唯一索引）
- `nickName`: 昵称
- `avatarUrl`: 头像 URL
- `createdAt`: 创建时间
- `updatedAt`: 更新时间

### water_records 表
- `id`: 主键（自增）
- `userId`: 用户 ID（外键关联 users.id）
- `date`: 日期（YYYY-MM-DD，与 userId 组成唯一索引）
- `water`: 当天总喝水量（ml）
- `records`: 喝水记录 JSON 数组 `[{ amount, time }]`
- `createdAt`: 创建时间
- `updatedAt`: 更新时间

**注意：** 应用启动时会自动创建这些表，无需手动创建。

## 注意事项

1. **JWT_SECRET** 必须设置一个强随机字符串，不要使用默认值
2. **WX_SECRET** 不要泄露，建议使用环境变量
3. 生产环境建议定期备份 MySQL 数据库
4. 确保服务器防火墙开放 3000 端口（或你配置的端口）
5. 小程序域名需要在微信公众平台配置：`https://drink.loner.cc`

