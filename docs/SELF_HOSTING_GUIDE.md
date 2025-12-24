# 健康养生平台 - 自托管部署指南

本文档详细介绍如何将项目部署到自己的服务器上。

---

## 目录

1. [环境要求](#环境要求)
2. [获取代码](#获取代码)
3. [环境配置](#环境配置)
4. [构建项目](#构建项目)
5. [Nginx 配置](#nginx-配置)
6. [HTTPS 配置](#https-配置)
7. [数据库连接](#数据库连接)
8. [常见问题](#常见问题)

---

## 环境要求

### 服务器要求
- **操作系统**: Ubuntu 20.04+ / CentOS 7+ / Debian 10+
- **内存**: 最低 1GB RAM
- **存储**: 最低 10GB 可用空间

### 软件要求
- **Node.js**: 18.x 或更高版本
- **npm**: 9.x 或更高版本
- **Nginx**: 1.18+
- **Git**: 2.x+

### 安装必要软件

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y nginx git curl

# 安装 Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 验证安装
node --version
npm --version
nginx -v
```

```bash
# CentOS/RHEL
sudo yum install -y nginx git curl

# 安装 Node.js 18.x
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs
```

---

## 获取代码

### 方式一：从 GitHub 克隆（推荐）

```bash
# 克隆仓库
git clone https://github.com/你的用户名/你的仓库名.git
cd 你的仓库名
```

### 方式二：直接上传代码

将项目代码打包上传到服务器后解压：

```bash
# 上传后解压
unzip project.zip -d /var/www/health-platform
cd /var/www/health-platform
```

---

## 环境配置

### 创建环境变量文件

在项目根目录创建 `.env` 文件：

```bash
nano .env
```

添加以下内容：

```env
# Supabase/Lovable Cloud 配置
VITE_SUPABASE_URL=https://uuhxlcfgbrozyjovdunl.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1aHhsY2ZnYnJvenlqb3ZkdW5sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1MDc0MDksImV4cCI6MjA4MjA4MzQwOX0.NOM_EDmrm-xcloggZg9XJaIERehEeP3gHv9pu_3Zx1A
VITE_SUPABASE_PROJECT_ID=uuhxlcfgbrozyjovdunl
```

### 安装依赖

```bash
npm install
```

---

## 构建项目

### 生产环境构建

```bash
npm run build
```

构建完成后，静态文件将生成在 `dist` 目录中。

### 验证构建结果

```bash
ls -la dist/
```

应该看到 `index.html` 和 `assets` 目录。

---

## Nginx 配置

### 创建 Nginx 配置文件

```bash
sudo nano /etc/nginx/sites-available/health-platform
```

### 基础配置（HTTP）

```nginx
server {
    listen 80;
    listen [::]:80;
    
    # 替换为你的域名或服务器 IP
    server_name your-domain.com www.your-domain.com;
    
    # 项目构建输出目录
    root /var/www/health-platform/dist;
    index index.html;
    
    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json application/xml+rss;
    gzip_comp_level 6;
    
    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }
    
    # SPA 路由支持 - 所有请求都返回 index.html
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # 禁止访问隐藏文件
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
    
    # 错误页面
    error_page 404 /index.html;
    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
    }
    
    # 日志配置
    access_log /var/log/nginx/health-platform.access.log;
    error_log /var/log/nginx/health-platform.error.log;
}
```

### 启用站点配置

```bash
# 创建软链接
sudo ln -s /etc/nginx/sites-available/health-platform /etc/nginx/sites-enabled/

# 删除默认站点（可选）
sudo rm /etc/nginx/sites-enabled/default

# 测试配置
sudo nginx -t

# 重载 Nginx
sudo systemctl reload nginx
```

### 设置目录权限

```bash
# 创建目录并复制构建文件
sudo mkdir -p /var/www/health-platform
sudo cp -r dist/* /var/www/health-platform/

# 设置权限
sudo chown -R www-data:www-data /var/www/health-platform
sudo chmod -R 755 /var/www/health-platform
```

---

## HTTPS 配置

### 使用 Let's Encrypt 免费证书

```bash
# 安装 Certbot
sudo apt install -y certbot python3-certbot-nginx

# 获取并配置证书（替换为你的域名）
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# 自动续期测试
sudo certbot renew --dry-run
```

### 完整的 HTTPS Nginx 配置

```nginx
# HTTP 重定向到 HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS 主配置
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    
    server_name your-domain.com www.your-domain.com;
    
    # SSL 证书配置
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    ssl_trusted_certificate /etc/letsencrypt/live/your-domain.com/chain.pem;
    
    # SSL 安全配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_stapling on;
    ssl_stapling_verify on;
    
    # HSTS
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # 项目目录
    root /var/www/health-platform/dist;
    index index.html;
    
    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json application/xml+rss;
    gzip_comp_level 6;
    
    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }
    
    # SPA 路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co wss://*.supabase.co;" always;
    
    # 禁止访问隐藏文件
    location ~ /\. {
        deny all;
    }
    
    # 日志
    access_log /var/log/nginx/health-platform.access.log;
    error_log /var/log/nginx/health-platform.error.log;
}
```

---

## 数据库连接

项目使用 Lovable Cloud (Supabase) 作为后端数据库，你可以使用任意 PostgreSQL 客户端直接连接：

### 连接信息

| 参数 | 值 |
|------|-----|
| **主机** | `db.uuhxlcfgbrozyjovdunl.supabase.co` |
| **端口** | `5432` |
| **数据库名** | `postgres` |
| **用户名** | `postgres` |
| **密码** | 在 Lovable Cloud 后端面板获取 |
| **SSL** | 必须启用 |

### 推荐客户端工具

- **DBeaver** (免费，跨平台): https://dbeaver.io/
- **pgAdmin** (官方工具): https://www.pgadmin.org/
- **TablePlus** (Mac 推荐): https://tableplus.com/
- **Navicat**: https://navicat.com/

### 命令行连接

```bash
# 使用 psql 连接
psql "postgresql://postgres:你的密码@db.uuhxlcfgbrozyjovdunl.supabase.co:5432/postgres?sslmode=require"
```

---

## 自动化部署脚本

创建部署脚本 `deploy.sh`：

```bash
#!/bin/bash

# 健康养生平台自动部署脚本
set -e

echo "🚀 开始部署..."

# 配置
PROJECT_DIR="/var/www/health-platform"
REPO_URL="https://github.com/你的用户名/你的仓库名.git"
BRANCH="main"

# 进入项目目录或克隆
if [ -d "$PROJECT_DIR/.git" ]; then
    echo "📥 拉取最新代码..."
    cd $PROJECT_DIR
    git fetch origin
    git reset --hard origin/$BRANCH
else
    echo "📦 克隆仓库..."
    git clone $REPO_URL $PROJECT_DIR
    cd $PROJECT_DIR
fi

# 安装依赖
echo "📦 安装依赖..."
npm ci --production=false

# 构建
echo "🔨 构建项目..."
npm run build

# 复制到 web 目录
echo "📁 部署文件..."
sudo cp -r dist/* /var/www/health-platform/

# 设置权限
sudo chown -R www-data:www-data /var/www/health-platform
sudo chmod -R 755 /var/www/health-platform

# 重载 Nginx
echo "🔄 重载 Nginx..."
sudo nginx -t && sudo systemctl reload nginx

echo "✅ 部署完成!"
echo "🌐 访问: https://your-domain.com"
```

使用方法：

```bash
chmod +x deploy.sh
./deploy.sh
```

---

## Systemd 服务（可选）

如果需要运行开发服务器或其他 Node.js 服务：

```bash
sudo nano /etc/systemd/system/health-platform.service
```

```ini
[Unit]
Description=Health Platform
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/health-platform
ExecStart=/usr/bin/npm run preview -- --host 0.0.0.0 --port 3000
Restart=on-failure
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=health-platform
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

```bash
# 启用并启动服务
sudo systemctl daemon-reload
sudo systemctl enable health-platform
sudo systemctl start health-platform

# 查看状态
sudo systemctl status health-platform
```

---

## 常见问题

### 1. 404 错误（刷新页面时）

确保 Nginx 配置中有 SPA 路由支持：

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

### 2. 静态资源加载失败

检查 `root` 路径是否正确指向 `dist` 目录：

```bash
ls -la /var/www/health-platform/dist/
```

### 3. API 请求跨域问题

项目已配置连接 Lovable Cloud，无需额外 CORS 配置。

### 4. 构建失败

```bash
# 清除缓存重新安装
rm -rf node_modules package-lock.json
npm install
npm run build
```

### 5. 权限问题

```bash
sudo chown -R www-data:www-data /var/www/health-platform
sudo chmod -R 755 /var/www/health-platform
```

### 6. 查看日志

```bash
# Nginx 错误日志
sudo tail -f /var/log/nginx/health-platform.error.log

# Nginx 访问日志
sudo tail -f /var/log/nginx/health-platform.access.log
```

---

## 更新部署

当代码有更新时：

```bash
cd /var/www/health-platform
git pull origin main
npm install
npm run build
sudo cp -r dist/* /var/www/health-platform/
sudo systemctl reload nginx
```

或直接运行部署脚本：

```bash
./deploy.sh
```

---

## 备份策略

### 定期备份数据库

```bash
# 创建备份脚本
nano backup-db.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/health-platform"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

pg_dump "postgresql://postgres:密码@db.uuhxlcfgbrozyjovdunl.supabase.co:5432/postgres?sslmode=require" > $BACKUP_DIR/backup_$DATE.sql

# 保留最近 7 天的备份
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete

echo "备份完成: $BACKUP_DIR/backup_$DATE.sql"
```

```bash
chmod +x backup-db.sh

# 添加定时任务（每天凌晨 2 点备份）
crontab -e
# 添加: 0 2 * * * /path/to/backup-db.sh
```

---

## 联系支持

如有问题，请参考 [Lovable 官方文档](https://docs.lovable.dev/tips-tricks/self-hosting)。
