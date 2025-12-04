# Git 部署步骤

## 服务器端操作

### 步骤 1：备份重要文件

```bash
cd /www/wwwroot/drinkwater-api
cp .env .env.backup
```

### 步骤 2：重新初始化 Git 仓库（推荐方式 B）

#### 方式 A：保留现有文件（如果有冲突需要解决）

```bash
cd /www/wwwroot/drinkwater-api
git init
git remote add origin https://github.com/goudan1030/dirnkwater.git
git checkout -b main
git pull origin main
# 如果有冲突，解决后：
cp .env.backup .env
```

#### 方式 B：清空重新克隆（推荐，更干净）

```bash
# 备份 .env
cd /www/wwwroot
cp drinkwater-api/.env drinkwater-api.env.backup

# 备份旧目录
mv drinkwater-api drinkwater-api-backup

# 克隆仓库
git clone https://github.com/goudan1030/dirnkwater.git temp-repo

# 移动 server 目录
mv temp-repo/server drinkwater-api
rm -rf temp-repo

# 进入新目录
cd drinkwater-api

# 初始化 Git（指向 server 目录的父仓库）
git init
git remote add origin https://github.com/goudan1030/dirnkwater.git
git checkout -b main

# 恢复配置文件
cp ../drinkwater-api.env.backup .env

# 安装依赖
npm install
```

### 步骤 3：验证配置

```bash
cd /www/wwwroot/drinkwater-api
git remote -v  # 应该显示 GitHub 仓库地址
```

### 步骤 4：重启服务

如果使用 PM2，需要重启：

```bash
pm2 restart drinkwater-api
```

## 后续更新代码

```bash
cd /www/wwwroot/drinkwater-api
git pull origin main
npm install  # 如果有新依赖
pm2 restart drinkwater-api  # 重启服务
```

