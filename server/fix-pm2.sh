#!/bin/bash

# PM2 检测和修复脚本
# 用于解决宝塔面板"未检测到pm2"的问题

echo "=========================================="
echo "PM2 检测和修复脚本"
echo "=========================================="
echo ""

# 1. 检查当前 Node 版本
echo "1. 检查当前 Node 版本："
node -v
npm -v
echo ""

# 2. 检查 PM2 是否已安装
echo "2. 检查 PM2 安装状态："
if command -v pm2 &> /dev/null; then
    echo "✓ PM2 已安装"
    pm2 -v
    echo "PM2 路径: $(which pm2)"
else
    echo "✗ PM2 未找到"
fi
echo ""

# 3. 检查所有可能的 PM2 安装位置
echo "3. 搜索 PM2 安装位置："
find /usr -name pm2 2>/dev/null | head -5
find /root -name pm2 2>/dev/null | head -5
find /home -name pm2 2>/dev/null | head -5
echo ""

# 4. 检查 npm 全局安装路径
echo "4. 检查 npm 全局安装路径："
npm config get prefix
npm root -g
echo ""

# 5. 重新安装 PM2（使用当前 Node 版本）
echo "5. 重新安装 PM2..."
echo "正在使用当前 Node 版本全局安装 PM2..."
npm install -g pm2

# 6. 验证安装
echo ""
echo "6. 验证 PM2 安装："
if command -v pm2 &> /dev/null; then
    echo "✓ PM2 安装成功！"
    pm2 -v
    echo ""
    echo "PM2 路径: $(which pm2)"
    echo ""
    echo "=========================================="
    echo "修复完成！"
    echo "=========================================="
    echo ""
    echo "下一步操作："
    echo "1. 在宝塔面板中，进入「Node项目」→ 你的项目"
    echo "2. 点击「重启」按钮"
    echo "3. 如果仍然报错，尝试："
    echo "   - 在项目配置中切换 Node 版本"
    echo "   - 或者使用宝塔「软件商店」中的「PM2 管理器」插件"
else
    echo "✗ PM2 安装失败，请检查错误信息"
fi

