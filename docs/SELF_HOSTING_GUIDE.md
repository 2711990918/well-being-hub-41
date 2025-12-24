# 健康养生平台 - 自托管部署指南

本文档详细介绍如何将项目部署到自己的服务器上，以及如何将数据库迁移到您自己的 Supabase 账户。

---

## 目录

1. [环境要求](#环境要求)
2. [获取代码](#获取代码)
3. [环境配置](#环境配置)
4. [构建项目](#构建项目)
5. [Nginx 配置](#nginx-配置)
6. [HTTPS 配置](#https-配置)
7. [数据库连接](#数据库连接)
8. [**迁移到自己的 Supabase（重要）**](#迁移到自己的-supabase)
9. [常见问题](#常见问题)

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

## 迁移到自己的 Supabase

将项目从 Lovable Cloud 迁移到您自己的 Supabase 账户，让您完全掌控数据库。

### 第一步：创建新的 Supabase 项目

1. 访问 [Supabase 官网](https://supabase.com/) 并注册/登录
2. 点击 "New Project" 创建新项目
3. 设置项目名称和数据库密码（**请妥善保存密码**）
4. 选择服务器区域（建议选择离用户最近的区域）
5. 等待项目创建完成（约 2 分钟）

### 第二步：导出当前数据库结构和数据

#### 方法一：使用 pg_dump 命令（推荐）

```bash
# 安装 PostgreSQL 客户端（如未安装）
# Ubuntu/Debian
sudo apt install postgresql-client

# macOS
brew install postgresql

# 导出完整数据库（结构 + 数据）
pg_dump "postgresql://postgres:你的密码@db.uuhxlcfgbrozyjovdunl.supabase.co:5432/postgres?sslmode=require" \
  --no-owner \
  --no-acl \
  --clean \
  --if-exists \
  > full_backup.sql

# 仅导出数据库结构（不含数据）
pg_dump "postgresql://postgres:你的密码@db.uuhxlcfgbrozyjovdunl.supabase.co:5432/postgres?sslmode=require" \
  --schema-only \
  --no-owner \
  --no-acl \
  > schema_only.sql

# 仅导出数据（不含结构）
pg_dump "postgresql://postgres:你的密码@db.uuhxlcfgbrozyjovdunl.supabase.co:5432/postgres?sslmode=require" \
  --data-only \
  --no-owner \
  --no-acl \
  > data_only.sql
```

#### 方法二：使用 DBeaver 图形界面

1. 连接到当前数据库（使用上方连接信息）
2. 右键点击数据库 → **工具** → **备份数据库**
3. 选择要导出的表和选项
4. 导出为 SQL 文件

### 第三步：在新 Supabase 项目中创建表结构

在新 Supabase 项目的 SQL Editor 中执行以下 SQL（这是当前项目的完整数据库结构）：

```sql
-- ==========================================
-- 健康养生平台数据库结构
-- ==========================================

-- 创建用户角色枚举
CREATE TYPE public.app_role AS ENUM ('admin', 'user', 'consultant');

-- ==========================================
-- 用户配置表
-- ==========================================
CREATE TABLE public.profiles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    username TEXT,
    avatar_url TEXT,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ==========================================
-- 用户角色表
-- ==========================================
CREATE TABLE public.user_roles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- ==========================================
-- 文章表
-- ==========================================
CREATE TABLE public.articles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    author_id UUID NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    cover_image TEXT,
    category TEXT NOT NULL DEFAULT 'general',
    tags TEXT[] DEFAULT '{}',
    is_published BOOLEAN DEFAULT false,
    views_count INTEGER DEFAULT 0,
    read_time INTEGER DEFAULT 5,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ==========================================
-- 慢性病记录表
-- ==========================================
CREATE TABLE public.chronic_diseases (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    disease_name TEXT NOT NULL,
    diagnosis_date DATE,
    current_status TEXT,
    medications TEXT[],
    doctor_notes TEXT,
    next_checkup DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ==========================================
-- 社区帖子表
-- ==========================================
CREATE TABLE public.community_posts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ==========================================
-- 咨询师档案表
-- ==========================================
CREATE TABLE public.consultant_profiles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    specialty TEXT NOT NULL DEFAULT '心理咨询',
    bio TEXT,
    experience_years INTEGER DEFAULT 0,
    certifications TEXT[],
    hourly_rate NUMERIC DEFAULT 100,
    is_available BOOLEAN DEFAULT true,
    rating NUMERIC DEFAULT 5.0,
    total_consultations INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ==========================================
-- 咨询记录表
-- ==========================================
CREATE TABLE public.consultations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    consultant_id UUID,
    consultant_name TEXT,
    topic TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    scheduled_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ==========================================
-- 饮食计划表
-- ==========================================
CREATE TABLE public.diet_plans (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    meal_type TEXT NOT NULL,
    calories INTEGER,
    ingredients TEXT[],
    instructions TEXT,
    suitable_for TEXT[],
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ==========================================
-- 运动计划表
-- ==========================================
CREATE TABLE public.exercise_plans (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    duration_minutes INTEGER,
    calories_burn INTEGER,
    equipment TEXT[],
    steps TEXT[],
    video_url TEXT,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ==========================================
-- 健康监测表
-- ==========================================
CREATE TABLE public.health_monitoring (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    record_date DATE NOT NULL DEFAULT CURRENT_DATE,
    blood_pressure_systolic INTEGER,
    blood_pressure_diastolic INTEGER,
    heart_rate INTEGER,
    blood_sugar NUMERIC,
    sleep_hours NUMERIC,
    water_intake INTEGER,
    steps INTEGER,
    mood TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ==========================================
-- 健康记录表
-- ==========================================
CREATE TABLE public.health_records (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    blood_type TEXT,
    height NUMERIC,
    weight NUMERIC,
    allergies TEXT[],
    medical_history TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ==========================================
-- 订单表
-- ==========================================
CREATE TABLE public.orders (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    item_id UUID NOT NULL,
    item_name TEXT NOT NULL,
    order_type TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    total_price NUMERIC NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    payment_method TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ==========================================
-- 产品表
-- ==========================================
CREATE TABLE public.products (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    price NUMERIC NOT NULL,
    stock INTEGER DEFAULT 0,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ==========================================
-- 系统设置表
-- ==========================================
CREATE TABLE public.system_settings (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    key TEXT NOT NULL UNIQUE,
    value JSONB NOT NULL,
    description TEXT,
    updated_by UUID,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ==========================================
-- 养生课程表
-- ==========================================
CREATE TABLE public.wellness_courses (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    instructor TEXT,
    duration_minutes INTEGER,
    price NUMERIC DEFAULT 0,
    max_participants INTEGER,
    current_participants INTEGER DEFAULT 0,
    start_date TIMESTAMP WITH TIME ZONE,
    location TEXT,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ==========================================
-- 数据库函数
-- ==========================================

-- 更新 updated_at 触发器函数
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 检查用户角色函数
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 新用户注册处理函数
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username)
  VALUES (new.id, new.raw_user_meta_data ->> 'username');
  RETURN new;
END;
$$;

-- ==========================================
-- 触发器
-- ==========================================

-- 自动更新 updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON public.articles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_chronic_diseases_updated_at BEFORE UPDATE ON public.chronic_diseases FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_community_posts_updated_at BEFORE UPDATE ON public.community_posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_consultant_profiles_updated_at BEFORE UPDATE ON public.consultant_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_consultations_updated_at BEFORE UPDATE ON public.consultations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_diet_plans_updated_at BEFORE UPDATE ON public.diet_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_exercise_plans_updated_at BEFORE UPDATE ON public.exercise_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_health_records_updated_at BEFORE UPDATE ON public.health_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_wellness_courses_updated_at BEFORE UPDATE ON public.wellness_courses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 新用户注册触发器
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 第四步：设置 RLS（行级安全策略）

在新 Supabase 项目的 SQL Editor 中执行：

```sql
-- ==========================================
-- 启用 RLS
-- ==========================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chronic_diseases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultant_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diet_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_monitoring ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wellness_courses ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- Profiles 策略
-- ==========================================
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- ==========================================
-- User Roles 策略
-- ==========================================
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (has_role(auth.uid(), 'admin'));

-- ==========================================
-- Articles 策略
-- ==========================================
CREATE POLICY "Published articles are viewable by everyone" ON public.articles FOR SELECT USING (is_published = true);
CREATE POLICY "Authors can view their own articles" ON public.articles FOR SELECT USING (auth.uid() = author_id);
CREATE POLICY "Authors can insert their own articles" ON public.articles FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors can update their own articles" ON public.articles FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Authors can delete their own articles" ON public.articles FOR DELETE USING (auth.uid() = author_id);

-- ==========================================
-- Chronic Diseases 策略
-- ==========================================
CREATE POLICY "Users can manage their own chronic disease records" ON public.chronic_diseases FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all chronic disease records" ON public.chronic_diseases FOR SELECT USING (has_role(auth.uid(), 'admin'));

-- ==========================================
-- Community Posts 策略
-- ==========================================
CREATE POLICY "Published posts are viewable by authenticated users" ON public.community_posts FOR SELECT USING ((is_published = true) OR (auth.uid() = user_id));
CREATE POLICY "Users can create their own posts" ON public.community_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own posts" ON public.community_posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all posts" ON public.community_posts FOR ALL USING (has_role(auth.uid(), 'admin'));

-- ==========================================
-- Consultant Profiles 策略
-- ==========================================
CREATE POLICY "Consultant profiles are viewable by everyone" ON public.consultant_profiles FOR SELECT USING (true);
CREATE POLICY "Consultants can insert their own profile" ON public.consultant_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Consultants can update their own profile" ON public.consultant_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage consultant profiles" ON public.consultant_profiles FOR ALL USING (has_role(auth.uid(), 'admin'));

-- ==========================================
-- Consultations 策略
-- ==========================================
CREATE POLICY "Users can manage their own consultations" ON public.consultations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all consultations" ON public.consultations FOR ALL USING (has_role(auth.uid(), 'admin'));

-- ==========================================
-- Diet Plans 策略
-- ==========================================
CREATE POLICY "Active diet plans are viewable by everyone" ON public.diet_plans FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage diet plans" ON public.diet_plans FOR ALL USING (has_role(auth.uid(), 'admin'));

-- ==========================================
-- Exercise Plans 策略
-- ==========================================
CREATE POLICY "Active exercise plans are viewable by everyone" ON public.exercise_plans FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage exercise plans" ON public.exercise_plans FOR ALL USING (has_role(auth.uid(), 'admin'));

-- ==========================================
-- Health Monitoring 策略
-- ==========================================
CREATE POLICY "Users can manage their own monitoring data" ON public.health_monitoring FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all monitoring data" ON public.health_monitoring FOR SELECT USING (has_role(auth.uid(), 'admin'));

-- ==========================================
-- Health Records 策略
-- ==========================================
CREATE POLICY "Users can manage their own health records" ON public.health_records FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all health records" ON public.health_records FOR SELECT USING (has_role(auth.uid(), 'admin'));

-- ==========================================
-- Orders 策略
-- ==========================================
CREATE POLICY "Users can view their own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage all orders" ON public.orders FOR ALL USING (has_role(auth.uid(), 'admin'));

-- ==========================================
-- Products 策略
-- ==========================================
CREATE POLICY "Active products are viewable by everyone" ON public.products FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage products" ON public.products FOR ALL USING (has_role(auth.uid(), 'admin'));

-- ==========================================
-- System Settings 策略
-- ==========================================
CREATE POLICY "Settings are viewable by admins" ON public.system_settings FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage settings" ON public.system_settings FOR ALL USING (has_role(auth.uid(), 'admin'));

-- ==========================================
-- Wellness Courses 策略
-- ==========================================
CREATE POLICY "Active courses are viewable by everyone" ON public.wellness_courses FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage courses" ON public.wellness_courses FOR ALL USING (has_role(auth.uid(), 'admin'));
```

### 第五步：导入数据

```bash
# 将之前导出的数据导入到新 Supabase 项目
psql "postgresql://postgres:新项目密码@db.新项目ID.supabase.co:5432/postgres?sslmode=require" < data_only.sql
```

或者使用 Supabase Dashboard 的 SQL Editor 执行数据插入语句。

### 第六步：获取新项目的 API 密钥

1. 进入新 Supabase 项目的 **Settings** → **API**
2. 复制以下信息：
   - **Project URL**: `https://你的项目ID.supabase.co`
   - **anon public key**: 用于前端连接
   - **service_role key**: 用于后端/管理操作（妥善保管）

### 第七步：更新项目配置

修改项目的 `.env` 文件：

```env
# 替换为新 Supabase 项目的配置
VITE_SUPABASE_URL=https://你的新项目ID.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=你的新anon_key
VITE_SUPABASE_PROJECT_ID=你的新项目ID
```

### 第八步：重新构建和部署

```bash
# 重新构建
npm run build

# 部署到服务器
sudo cp -r dist/* /var/www/health-platform/
sudo systemctl reload nginx
```

### 第九步：配置 Edge Functions（如有需要）

如果项目使用了 Edge Functions（如 AI 聊天功能），需要：

1. 安装 Supabase CLI：
   ```bash
   npm install -g supabase
   ```

2. 登录并链接项目：
   ```bash
   supabase login
   supabase link --project-ref 你的新项目ID
   ```

3. 部署 Edge Functions：
   ```bash
   supabase functions deploy ai-chat
   ```

4. 设置函数所需的密钥：
   ```bash
   supabase secrets set LOVABLE_API_KEY=你的API密钥
   ```

### 迁移检查清单

- [ ] 新 Supabase 项目已创建
- [ ] 数据库结构已导入
- [ ] RLS 策略已配置
- [ ] 数据已迁移
- [ ] `.env` 文件已更新
- [ ] 项目已重新构建
- [ ] Edge Functions 已部署（如有）
- [ ] 测试登录功能
- [ ] 测试数据读写功能

### 迁移后访问数据库

迁移完成后，您可以使用任意 PostgreSQL 客户端连接您自己的 Supabase 数据库：

| 参数 | 值 |
|------|-----|
| **主机** | `db.你的项目ID.supabase.co` |
| **端口** | `5432` |
| **数据库名** | `postgres` |
| **用户名** | `postgres` |
| **密码** | 创建项目时设置的密码 |
| **SSL** | 必须启用 |

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
