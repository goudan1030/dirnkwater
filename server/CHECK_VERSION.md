# 如何检查服务器代码是否为 GitHub 最新版本

## 方法一：使用 git status（最简单）

```bash
cd /www/wwwroot/drinkwater-api

# 获取远程最新信息（不合并）
git fetch origin

# 检查本地和远程的差异
git status
```

**结果判断：**
- 显示 `Your branch is up to date with 'origin/main'` → 代码是最新的
- 显示 `Your branch is behind 'origin/main' by X commits` → 代码落后，需要更新
- 显示 `Your branch is ahead of 'origin/main' by X commits` → 本地有新提交未推送

## 方法二：比较提交记录

```bash
cd /www/wwwroot/drinkwater-api

# 查看本地最新提交
git log -1 --oneline

# 获取远程信息
git fetch origin

# 查看远程最新提交
git log origin/main -1 --oneline

# 比较本地和远程的提交记录
git log HEAD..origin/main --oneline
```

**结果判断：**
- 没有任何输出 → 代码是最新的
- 有输出显示提交记录 → 代码落后，需要拉取这些提交

## 方法三：一行命令快速检查

```bash
cd /www/wwwroot/drinkwater-api && git fetch origin && git status
```

## 方法四：查看具体的差异

```bash
cd /www/wwwroot/drinkwater-api

# 获取远程信息
git fetch origin

# 查看本地和远程的文件差异
git diff HEAD origin/main --stat

# 查看详细的代码差异
git diff HEAD origin/main
```

## 方法五：查看提交数量差异

```bash
cd /www/wwwroot/drinkwater-api

git fetch origin

# 统计本地和远程的提交差异
echo "本地提交数: $(git rev-list --count HEAD)"
echo "远程提交数: $(git rev-list --count origin/main)"
echo "落后提交数: $(git rev-list --count HEAD..origin/main)"
```

## 推荐使用方法一

最简单直接的方式：

```bash
cd /www/wwwroot/drinkwater-api
git fetch origin
git status
```

如果有更新，会显示：
```
Your branch is behind 'origin/main' by 1 commit, and can be fast-forwarded.
  (use "git pull" to update your local branch)
```

然后执行 `git pull origin main` 即可更新。

