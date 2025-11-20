---
title: lsyncd自动同步实战记录
date: 2025-09-29 23:39:23
categories: 
- 数据管理
tags: 
- 数据同步
- lsyncd
katex: true
---

# **Lsyncd 配置与使用完整指南**

    基本上是和ChatGPT交流后得到的流程，因为涉及的对话很长还有bug调试，所以就直接让GPT总结了一下。以下均为AI总结生成。

（适用于：数据盘 → 资源盘，实时同步，3 天回收保护，容器内 supervisor 托管）

---

## 1. 背景与目标

* **数据盘**：`/root/data-tmp`（SSD，高速但会随实例释放）
* **资源盘**：`/root/data-fs`（持久化存储，适合保存代码/备份）
* **需求**：

  1. 数据盘内容实时同步到资源盘
  2. 支持删除保护，至少保留 3 天的历史版本
  3. 支持进程守护，关闭 SSH 连接后依然运行

---

## 2. 目录结构（统一规范）

执行以下命令准备目录：

```bash
mkdir -p \
  /root/data-tmp/projects \
  /root/data-fs/backup/projects \
  /root/data-fs/backup/.trash/current \
  /root/data-fs/lsyncd
```

目录说明：

* `/root/data-tmp/projects/` → 源数据（代码、环境等）
* `/root/data-fs/backup/projects/` → 实时镜像
* `/root/data-fs/backup/.trash/` → 回收站（保留最近 3 天删除/覆盖的旧文件）
* `/root/data-fs/lsyncd/` → 日志与状态文件

---

## 3. 首次全量同步（避免海量 inotify 事件）

```bash
rsync -aHv /root/data-tmp/projects/ /root/data-fs/backup/projects/
```

> ⚠️ 首次执行时 **不要带 `--delete`**，避免误删资源盘已有文件。

---

## 4. Lsyncd 配置文件

新建 `/etc/lsyncd.conf.lua`：

```lua
settings {
  logfile        = "/root/data-fs/lsyncd/lsyncd.log",
  statusFile     = "/root/data-fs/lsyncd/lsyncd.status",
  statusInterval = 5,
  maxProcesses   = 4
}

sync {
  default.rsync,
  source = "/root/data-tmp/projects/",
  target = "/root/data-fs/backup/projects/",
  delete = true,      -- 保持镜像一致（只影响目标，不动源）
  delay = 2,
  rsync = {
    archive  = true,
    compress = true,
    _extra   = {
      "--partial",
      "--inplace",
      "--backup",
      "--backup-dir=/root/data-fs/backup/.trash/current",
      "--exclude=.git/",
      "--exclude=**/node_modules/",
      "--exclude=**/.venv/",
      "--exclude=**/__pycache__/",
      "--exclude=**/*.tmp",
      "--exclude=**/.cache/"
    }
  }
}
```

---

## 5. 回收站轮转脚本（保留 3 天）

新建 `/usr/local/bin/cleanup-trash.sh`：

```bash
#!/bin/bash
set -euo pipefail
TRASH_BASE="/root/data-fs/backup/.trash"
TODAY=$(date +%F)

mkdir -p "$TRASH_BASE/current"

# 把 current 目录转成当天快照
if [ -d "$TRASH_BASE/current" ] && [ -n "$(ls -A "$TRASH_BASE/current" 2>/dev/null)" ]; then
  mv "$TRASH_BASE/current" "$TRASH_BASE/$TODAY"
fi
mkdir -p "$TRASH_BASE/current"

# 删除 3 天前的快照
find "$TRASH_BASE" -maxdepth 1 -type d -regex '.*/[0-9]{4}-[0-9]{2}-[0-9]{2}$' -mtime +3 -exec rm -rf {} \;
```

赋权：

```bash
chmod +x /usr/local/bin/cleanup-trash.sh
```

---

## 6. 进程守护（supervisor）

安装：

```bash
apt update && apt install -y supervisor
```

配置 `/etc/supervisor/conf.d/backup-stack.conf`：

```ini
[program:lsyncd]
command=/usr/bin/lsyncd -nodaemon /etc/lsyncd.conf.lua
autorestart=true
startsecs=3
startretries=10
redirect_stderr=true
stdout_logfile=/var/log/supervisor/lsyncd.out.log
stderr_logfile=/var/log/supervisor/lsyncd.err.log

[program:cron]
command=/usr/sbin/cron -f
autorestart=true
stdout_logfile=/var/log/supervisor/cron.out.log
stderr_logfile=/var/log/supervisor/cron.err.log
```

新增定时任务 `/etc/cron.d/cleanup-trash`：

```cron
0 3 * * * root /usr/local/bin/cleanup-trash.sh
```

启动：

```bash
supervisorctl reread
supervisorctl update
supervisorctl start all
supervisorctl status
```

---

## 7. 日常巡检 checklist

1. **进程状态**

   ```bash
   supervisorctl status lsyncd
   ```

   应为 `RUNNING`

2. **同步是否正常**

   ```bash
   cat /root/data-fs/lsyncd/lsyncd.status
   ```

3. **实时测试**

   ```bash
   echo "test" > /root/data-tmp/projects/test.txt
   ls /root/data-fs/backup/projects/ | grep test.txt
   ```

4. **回收站检查**

   ```bash
   rm /root/data-tmp/projects/test.txt
   find /root/data-fs/backup/.trash/current -name test.txt
   ```

5. **每日快照**
   第二天早上看：

   ```bash
   ls /root/data-fs/backup/.trash/
   ```

   应该有 `2025-09-30` 这样的目录，只保留最近 3 天。

---

## 8. 整体工作流

1. Lsyncd：实时同步数据盘 → 资源盘
2. Rsync 参数：增量 + 回收站（删除/覆盖保护）
3. Cron 脚本：每日轮转回收站，只保留 3 天
4. Supervisor：守护进程，自动重启，SSH 退出不影响

---

✨ 这样，你已经搭建好了一套稳定、安全的同步与备份体系。

---
