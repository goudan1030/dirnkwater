# 服务器环境安装指南

## 需要安装的软件

根据后端代码依赖，你的服务器需要安装以下软件：

### 必需软件

1. **Node.js** (>= 14.0.0，推荐 16.x 或 18.x)
   - 用于运行后端 API 服务
   - npm 会随 Node.js 一起安装

2. **MySQL** (>= 5.7 或 >= 8.0)
   - 用于存储用户数据和喝水记录
   - 宝塔面板通常自带 MySQL/MariaDB

3. **PM2** (可选，但推荐)
   - 用于进程管理，确保服务稳定运行
   - 宝塔面板通常自带 PM2 管理器

---

## 宝塔面板安装步骤

### 方法一：通过宝塔软件商店安装（推荐）

#### 1. 安装 Node.js

1. 登录宝塔面板
2. 点击左侧「软件商店」
3. 搜索「Node 版本管理器」或「Node.js」
4. 点击「安装」
5. 安装完成后，点击「设置」
6. 在「Node 版本管理」中，安装 Node.js 版本：
   - 推荐安装：**Node.js 16.x** 或 **18.x**
   - 点击「安装版本」，选择版本后安装

#### 2. 安装 MySQL

1. 在「软件商店」中搜索「MySQL」
2. 选择版本（推荐 **MySQL 5.7** 或 **8.0**，或 **MariaDB 10.x**）
3. 点击「安装」
4. 等待安装完成（可能需要几分钟）
5. 安装完成后，点击「设置」
6. 在「root 密码」中设置 MySQL root 密码（**重要：请记住这个密码**）
7. 在「服务」标签页中，点击「启动」确保 MySQL 运行

**创建数据库：**
1. 在 MySQL 设置中，点击「数据库」标签页
2. 点击「添加数据库」
3. 数据库名：`drink`
4. 用户名：`drink`（或使用 root）
5. 密码：设置一个强密码（**记住这个密码，需要填入 .env 文件**）
6. 访问权限：选择「本地服务器」
7. 点击「提交」

#### 3. 安装 PM2 管理器（可选但推荐）

1. 在「软件商店」中搜索「PM2 管理器」
2. 点击「安装」
3. 安装完成后可以使用 PM2 管理 Node.js 项目

---

### 方法二：通过 SSH 命令行安装

如果宝塔软件商店没有相关软件，可以通过 SSH 安装：

#### 1. 安装 Node.js

```bash
# 使用 NodeSource 官方源安装 Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 验证安装
node -v
npm -v
```

#### 2. 安装 MySQL

```bash
# 更新软件包列表
sudo apt-get update

# 安装 MySQL
sudo apt-get install -y mysql-server

# 启动 MySQL
sudo systemctl start mysql
sudo systemctl enable mysql

# 安全配置（设置 root 密码）
sudo mysql_secure_installation

# 验证安装
sudo systemctl status mysql
```

**创建数据库和用户：**

```bash
# 登录 MySQL
sudo mysql -u root -p

# 在 MySQL 中执行以下命令
CREATE DATABASE drink CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'drink'@'localhost' IDENTIFIED BY '你的密码';
GRANT ALL PRIVILEGES ON drink.* TO 'drink'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### 3. 安装 PM2（全局）

```bash
sudo npm install -g pm2
```

---

## 验证安装

安装完成后，通过 SSH 或宝塔终端验证：

```bash
# 检查 Node.js 版本
node -v
# 应该显示：v16.x.x 或 v18.x.x

# 检查 npm 版本
npm -v
# 应该显示：8.x.x 或 9.x.x

# 检查 MySQL 状态
sudo systemctl status mysql
# 或
mysql --version

# 测试 MySQL 连接
mysql -u drink -p drink
# 输入密码后应该能进入 MySQL

# 检查 PM2（如果安装了）
pm2 -v
```

---

## 配置数据库连接

### 1. 在 .env 文件中配置 MySQL

编辑 `.env` 文件，填入你的 MySQL 配置：

```env
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=drink
MYSQL_PASSWORD=你的数据库密码
MYSQL_DATABASE=drink
MYSQL_CHARSET=utf8mb4
```

### 2. 测试数据库连接

应用启动时会自动创建数据表，如果连接失败会显示错误信息。

你也可以手动测试：

```bash
# 在项目目录下
node -e "require('dotenv').config(); const mysql = require('mysql2/promise'); mysql.createConnection({host: process.env.MYSQL_HOST, user: process.env.MYSQL_USER, password: process.env.MYSQL_PASSWORD, database: process.env.MYSQL_DATABASE}).then(() => console.log('连接成功')).catch(err => console.error('连接失败:', err))"
```

---

## 配置防火墙

确保以下端口已开放：
- **3000**：Node.js 应用端口（如果直接访问）
- **3306**：MySQL 端口（仅本地访问，不要对外开放）

在宝塔面板「安全」中配置：
- 添加端口规则：`3000`，类型：TCP，策略：允许
- **不要**开放 3306 端口到公网

---

## 常见问题

### Q: 宝塔面板找不到 Node.js？

**A:** 某些版本的宝塔可能没有这些软件，可以：
1. 更新宝塔面板到最新版本
2. 使用 SSH 命令行安装（见方法二）

### Q: MySQL 启动失败？

**A:** 检查：
1. 查看错误日志：`/www/server/mysql/mysql-error.log`
2. 检查数据目录权限
3. 检查端口是否被占用：`netstat -tlnp | grep 3306`

### Q: 无法连接数据库？

**A:** 检查：
1. MySQL 服务是否运行：`sudo systemctl status mysql`
2. 用户名和密码是否正确
3. 用户是否有权限访问数据库
4. 防火墙是否阻止了连接

### Q: Node.js 版本太低？

**A:** 使用 Node 版本管理器（nvm）：
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18
```

---

## 下一步

安装完成后，继续按照 `README.md` 中的部署步骤操作：
1. 上传代码到服务器
2. 在宝塔面板创建 Node 项目
3. 配置环境变量（填入 MySQL 配置）
4. 启动项目（会自动创建数据表）
