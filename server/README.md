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

3. **检查并配置项目端口（重要 - 必须先检查端口占用）**
   
   **⚠️ 重要：在配置端口前，必须先检查端口是否被占用！**
   
   **步骤 1：检查端口占用情况**
   - 通过 SSH 登录服务器，执行以下命令检查端口占用：
     ```bash
     # 检查 3000 端口是否被占用
     netstat -tlnp | grep 3000
     # 或使用
     lsof -i :3000
     # 或使用
     ss -tlnp | grep 3000
     ```
   - 如果端口已被占用，会显示占用该端口的进程信息
   - **如果端口被占用，有两种选择：**
     - **选择 A：停止占用端口的进程**（如果该进程不需要）
       ```bash
       # 查看占用端口的进程 PID
       lsof -i :3000
       # 或
       netstat -tlnp | grep 3000
       
       # 停止进程（替换 PID 为实际进程 ID）
       kill -9 PID
       ```
     - **选择 B：更换端口**（推荐，避免影响其他服务）
       - 选择一个未被占用的端口，例如：`3001`、`3002`、`8080` 等
       - 检查新端口是否可用：
         ```bash
         netstat -tlnp | grep 3001
         ```
       - 如果新端口未被占用，使用新端口
   
   **步骤 2：配置项目端口**
   - 项目创建后，在项目列表中点击 `drinkwater-api` 项目右侧的「设置」
   - 在左侧导航中选择「项目配置」
   - 找到「监听端口」或「项目端口」设置
   - 填写端口：
     - 如果 3000 端口可用：填写 `3000`
     - 如果 3000 端口被占用：填写你选择的新端口（例如 `3001`）
   - **重要**：记住你填写的端口号，后续配置需要使用
   - 保存配置
   
   **步骤 3：更新环境变量中的端口**
   - 如果使用了新端口，必须同步更新 `.env` 文件：
     ```bash
     cd /www/wwwroot/drinkwater-api
     nano .env
     ```
   - 修改 `PORT` 值，确保与项目配置中的端口一致：
     ```
     PORT=3000  # 或你选择的其他端口
     ```
   - 保存文件

3. **安装 PM2（如果提示未检测到 PM2）**
   - 如果项目状态显示"未检测到pm2"错误，需要先安装 PM2
   - **方法一：通过宝塔软件商店安装**
     - 在「软件商店」中搜索「PM2 管理器」
     - 点击「安装」
   - **方法二：通过 SSH 命令行安装**
     ```bash
     # 全局安装 PM2
     npm install -g pm2
     
     # 验证安装
     pm2 -v
     ```
   - **方法三：检查 Node 版本**
     - 在项目设置中，确保 Node 版本已正确安装
     - 如果 Node 版本显示异常，尝试切换 Node 版本
     - 建议使用 Node.js 16.x 或 18.x

4. **安装依赖（如果未安装）**
   - 项目创建后，如果未勾选「不安装node_module」，宝塔会自动安装依赖
   - 如果已勾选，需要手动安装：
     - 在项目列表中，找到 `drinkwater-api` 项目
     - 点击「终端」或通过 SSH 进入项目目录：
       ```bash
       cd /www/wwwroot/drinkwater-api
       npm install
       ```

5. **配置域名（开启外网映射前必须先配置）**
   - 在项目设置中，点击左侧「域名管理」
   - 点击「添加域名」
   - 填写域名：`drink.loner.cc`
   - 点击「提交」
   - **重要**：必须先添加域名，才能开启外网映射

6. **配置环境变量**
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

7. **配置 SSL 证书**
   - 在项目设置中，点击左侧「SSL」
   - 选择「Let's Encrypt」，点击「申请」
   - 宝塔会自动配置 HTTPS 和证书续期

8. **配置外网映射（可选）**
   - 在项目设置中，点击左侧「外网映射」
   - 如果需要在公网通过 80/443 端口访问，可以开启外网映射
   - **前提条件**：
     - 已配置监听端口（步骤3）
     - 已添加域名（步骤4）
   - 开启后，可以通过 `https://drink.loner.cc` 直接访问（无需 `/api` 前缀）
   - **注意**：如果使用反向代理（推荐），则不需要开启外网映射

9. **配置反向代理（重要）**
   - 由于接口路径是 `/api/*`，需要在 Nginx 配置中添加反向代理
   - 在项目设置中，点击「配置文件」或「Nginx配置」
   - 在 `location /` 块中添加：
     ```nginx
     location /api {
         proxy_pass http://localhost:你的端口号;  # 注意：这里要填写你在步骤3中配置的实际端口
         proxy_set_header Host $host;
         proxy_set_header X-Real-IP $remote_addr;
         proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
         proxy_set_header X-Forwarded-Proto $scheme;
     }
     ```
   - **重要**：`proxy_pass` 中的端口必须与步骤3中配置的端口一致
   - 例如，如果配置的是 3000 端口：
     ```nginx
     proxy_pass http://localhost:3000;
     ```
   - 如果配置的是 3001 端口：
     ```nginx
     proxy_pass http://localhost:3001;
     ```
   - 保存配置并重载 Nginx

10. **启动 PM2 项目**
   - 在项目列表中，找到 `drinkwater-api` 项目
   - 点击项目右侧的「设置」
   - 在「项目配置」页面，点击「启动」按钮
   - 如果状态显示「运行中」，说明启动成功
   - 如果仍然显示「停止」或报错，检查：
     - PM2 是否已正确安装（见步骤3）
     - Node 版本是否正确
     - 项目依赖是否已安装（见步骤4）
     - 环境变量是否配置正确（见步骤6）
   - 可以点击「项目日志」查看详细错误信息

11. **PM2 管理功能**
   - **查看状态**：在项目列表中可以看到运行状态（运行中/已停止）
   - **查看日志**：点击「日志」按钮查看实时日志
   - **重启项目**：点击「重启」按钮
   - **停止项目**：点击「停止」按钮
   - **内存监控**：PM2 会自动监控内存使用，超过上限会自动重启

12. **测试接口**
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

## 常见问题排查

### Q: 提示"未检测到pm2,请先安装pm2或切换node版本后再试"

**问题原因：**
- PM2 安装在了不同的 Node 版本下（常见于使用 nvm 或宝塔 Node 版本管理器）
- PM2 的安装路径不在宝塔检测的 PATH 中
- Node 版本切换后，PM2 需要重新安装

**解决方案（按顺序尝试）：**

#### 方案一：使用修复脚本（推荐）

1. **通过 SSH 登录服务器**
2. **进入项目目录并运行修复脚本**
   ```bash
   cd /path/to/your/project/server
   chmod +x fix-pm2.sh
   ./fix-pm2.sh
   ```
3. **在宝塔面板中重启项目**

#### 方案二：手动重新安装 PM2

1. **通过 SSH 登录服务器**
2. **检查当前 Node 版本**
   ```bash
   node -v
   npm -v
   ```
3. **在当前 Node 版本下重新安装 PM2**
   ```bash
   # 卸载旧版本（如果存在）
   npm uninstall -g pm2
   
   # 重新全局安装
   npm install -g pm2
   
   # 验证安装
   pm2 -v
   which pm2  # 查看 PM2 安装路径
   ```
4. **在宝塔面板中：**
   - 进入「Node项目」→ 你的项目
   - 在「项目配置」中，确认 Node 版本与安装 PM2 的版本一致
   - 点击「重启」

#### 方案三：使用宝塔 PM2 管理器插件

1. **在宝塔面板「软件商店」中搜索「PM2 管理器」**
2. **安装 PM2 管理器插件**
3. **在 PM2 管理器中启动项目**（而不是在 Node 项目中）

#### 方案四：切换 Node 版本并重新安装

1. **在宝塔面板「Node版本管理器」中：**
   - 选择一个稳定的 Node 版本（建议 16.x 或 18.x）
   - 如果已安装，直接切换；如果未安装，先安装
2. **通过 SSH 登录，使用新版本安装 PM2**
   ```bash
   # 确保使用正确的 Node 版本
   node -v
   
   # 安装 PM2
   npm install -g pm2
   pm2 -v
   ```
3. **在项目配置中选择对应的 Node 版本**
4. **重启项目**

**验证修复：**
- 在宝塔面板中，项目状态应该显示为「运行中」而不是「未检测到pm2」
- 可以通过 `pm2 list` 命令查看运行中的进程

### Q: 项目启动后立即停止

**可能原因和解决方案：**

1. **检查端口占用（最重要）**
   - 确认配置的端口未被其他进程占用：
     ```bash
     # 检查端口占用（替换为你的实际端口）
     netstat -tlnp | grep 3000
     # 或
     lsof -i :3000
     ```
   - 如果端口被占用：
     - 停止占用端口的进程，或
     - 更换为其他可用端口，并同步更新 `.env` 和 Nginx 配置

2. **检查环境变量**
   - 确认 `.env` 文件已创建且配置正确
   - 确认 `PORT` 值与项目配置中的端口一致
   - 特别是 MySQL 连接信息是否正确

3. **检查数据库连接**
   - 确认 MySQL 服务正在运行
   - 测试数据库连接：
     ```bash
     mysql -u drink -p drink
     ```

4. **查看项目日志**
   - 在项目设置中点击「项目日志」
   - 查看具体错误信息，常见错误：
     - `EADDRINUSE`：端口已被占用
     - `ECONNREFUSED`：数据库连接失败
     - `ENOENT`：找不到文件或目录

### Q: 无法访问接口，返回 404

**解决方案：**

1. **检查反向代理配置**
   - 确认 Nginx 配置中已添加 `/api` 路径的反向代理
   - **重要**：确认 `proxy_pass` 中的端口与项目实际端口一致
   - 如果项目端口是 3001，但 Nginx 配置的是 3000，会导致 404
   - 检查方法：
     ```bash
     # 查看 Nginx 配置
     cat /www/server/panel/vhost/nginx/drink.loner.cc.conf
     # 或通过宝塔面板查看配置文件
     ```

2. **检查项目是否运行**
   - 在项目列表中确认状态为「运行中」
   - 如果已停止，点击「启动」

3. **检查项目监听的端口**
   - 确认项目实际监听的端口：
     ```bash
     netstat -tlnp | grep node
     # 或
     lsof -i -P | grep node
     ```
   - 确认端口与 `.env` 和 Nginx 配置一致

4. **检查域名和 SSL**
   - 确认域名已正确添加
   - 确认 SSL 证书已申请并生效

### Q: 端口已被占用怎么办？

**解决方案：**

1. **查看占用端口的进程详细信息**
   ```bash
   # 方法一：使用 netstat
   netstat -tlnp | grep 3000
   
   # 方法二：使用 lsof
   lsof -i :3000
   
   # 方法三：使用 ss
   ss -tlnp | grep 3000
   
   # 查看进程的完整路径和命令（替换 PID 为实际进程 ID）
   ps aux | grep PID
   # 或
   cat /proc/PID/cmdline
   ```

2. **判断进程是否可以停止**
   - 查看进程的完整路径，确认是否是：
     - 之前启动的同一个项目（可以停止后重新启动）
     - 其他重要服务（建议更换端口）
   - 查看进程启动时间：
     ```bash
     ps -p PID -o lstart,cmd
     ```

3. **决定处理方式**

   **情况 A：如果是同一个项目或测试进程（可以停止）**
   ```bash
   # 方法一：优雅停止（推荐）
   kill PID
   
   # 方法二：强制停止（如果方法一无效）
   kill -9 PID
   
   # 如果是 PM2 管理的进程，使用 PM2 停止
   pm2 stop all
   # 或停止特定进程
   pm2 stop 进程名
   ```
   
   **情况 B：如果是其他重要服务（建议更换端口）**
   - 选择一个可用端口（建议 3001-3010 或 8080-8090）
   - 检查新端口：
     ```bash
     netstat -tlnp | grep 3001
     # 如果没有输出，说明端口可用
     ```
   - 如果可用，更新以下配置：
     - 项目配置中的端口
     - `.env` 文件中的 `PORT`
     - Nginx 反向代理中的 `proxy_pass` 端口

4. **常用端口范围建议**
   - 开发环境：3000-3010
   - 生产环境：8080-8090 或 9000-9010
   - 避免使用：80、443、3306、22 等系统常用端口

5. **验证端口已释放或更换成功**
   ```bash
   # 再次检查端口
   netstat -tlnp | grep 3000
   # 如果没有输出，说明端口已释放
   
   # 如果更换了端口，检查新端口
   netstat -tlnp | grep 新端口号
   ```

### Q: 数据库连接失败

**解决方案：**

1. **检查 MySQL 服务**
   ```bash
   sudo systemctl status mysql
   ```

2. **检查数据库配置**
   - 确认 `.env` 文件中的数据库信息正确
   - 测试连接：
     ```bash
     mysql -h localhost -u drink -p drink
     ```

3. **检查数据库权限**
   - 确认用户有访问数据库的权限
   - 如果使用 root 用户，确认密码正确

## 注意事项

1. **JWT_SECRET** 必须设置一个强随机字符串，不要使用默认值
2. **WX_SECRET** 不要泄露，建议使用环境变量
3. 生产环境建议定期备份 MySQL 数据库
4. 确保服务器防火墙开放 3000 端口（或你配置的端口）
5. 小程序域名需要在微信公众平台配置：`https://drink.loner.cc`

