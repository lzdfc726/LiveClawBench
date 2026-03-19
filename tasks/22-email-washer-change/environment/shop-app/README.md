# E-Commerce Mosi Shop

Standalone e-commerce simulation platform, built based on the sandbox module from the ACES project.

## 📋 Project Overview

This is a lightweight e-commerce simulation application that provides complete product search, browsing, and shopping cart functionality. Extracted and made standalone from the ACES project, it features one-click startup capability without requiring dependencies on the complete project environment.

### 主要特性

- 🛍️ **商品搜索**：支持关键词搜索、分类浏览
- 🔍 **智能排序**：按价格、评分、相似度排序
- 🏷️ **产品标签**：赞助、畅销、限时优惠等多种标签
- ⭐ **评分系统**：五星评分和评论数量展示
- 🛒 **购物车模拟**：模拟添加购物车功能
- 📱 **响应式设计**：支持多种设备屏幕尺寸
- 🔌 **RESTful API**：提供完整的商品查询API
- 🎨 **美观界面**：仿亚马逊风格的UI设计

## 📁 目录结构

```
shop-app/
├── backend/                  # 后端服务
│   ├── app.py               # FastAPI主应用
│   ├── requirements.txt     # Python依赖
│   └── start.sh             # 启动脚本
├── frontend/                # 前端资源
│   ├── templates/           # HTML模板
│   │   ├── search.html     # 搜索首页
│   │   └── results.html    # 结果展示页
│   ├── static/             # 静态资源
│   │   └── css/
│   │       └── style.css   # 样式文件
│   └── data/               # 数据文件
│       └── sample_products.json  # 示例商品数据
└── README.md               # 项目说明文档
```

## 🚀 快速开始

### 环境要求

- Python 3.8 或更高版本
- pip 包管理器

### 安装依赖

```bash
# 进入后端目录
cd shop-app/backend

# 安装Python依赖
pip install -r requirements.txt
```

### 启动服务

#### 方式一：使用启动脚本（推荐）

```bash
cd backend
./start.sh
```

#### 方式二：直接运行Python

```bash
cd backend
python3 app.py
```

#### 方式三：使用uvicorn

```bash
cd backend
uvicorn app:app --host 0.0.0.0 --port 1234 --reload
```

### 访问应用

启动成功后，通过以下地址访问：

- **主页**：http://localhost:1234
- **API文档**：http://localhost:1234/docs
- **健康检查**：http://localhost:1234/health

## 📚 使用指南

### Web界面使用

1. **首页搜索**
   - 打开 http://localhost:1234
   - 在搜索框输入关键词
   - 点击搜索按钮或按回车

2. **快速搜索**
   - 点击首页的快速链接（笔记本电脑、手机、耳机、相机）

3. **商品浏览**
   - 在搜索结果页面，可以按价格、评分排序
   - 点击"Add to Cart"按钮模拟添加购物车
   - 使用分页导航浏览更多商品

### API使用

#### 1. 搜索商品

```http
GET /api/products?q=laptop&sort=price_asc&page=1
```

**参数说明**：
- `q`：搜索关键词（可选）
- `sort`：排序方式（similarity, price_asc, price_desc, rating）
- `page`：页码（默认：1）
- `min_price`：最低价格（可选）
- `max_price`：最高价格（可选）
- `min_rating`：最低评分（可选）

**响应示例**：

```json
{
  "products": [
    {
      "id": "prod_0001",
      "title": "MacBook Pro laptop Pro - 2024",
      "price": 2499.99,
      "rating": 4.7,
      "rating_count": "15,234 ratings",
      "image_url": "https://picsum.photos/seed/1/300/300",
      "sponsored": false,
      "best_seller": true,
      "overall_pick": false,
      "limited_time": false,
      "discounted": false,
      "low_stock": false
    }
  ],
  "total_products": 150,
  "total_pages": 5,
  "current_page": 1,
  "products_per_page": 30
}
```

#### 2. 获取商品详情

```http
GET /api/product/{product_id}
```

**响应示例**：

```json
{
  "id": "prod_0001",
  "title": "MacBook Pro laptop Pro - 2024",
  "price": 2499.99,
  "rating": 4.7,
  "rating_count": "15,234 ratings",
  "image_url": "https://picsum.photos/seed/1/300/300",
  "category": "laptop"
}
```

## 🔧 配置说明

### 修改端口

编辑 `backend/app.py` 文件最后一行：

```python
uvicorn.run(app, host="0.0.0.0", port=1234, reload=True)
```

将 `port=1234` 改为您需要的端口。

### 修改每页商品数量

编辑 `backend/app.py` 文件中的常量：

```python
PRODUCTS_PER_PAGE = 30  # 修改为您需要的数量
```

### 自定义商品数据

商品数据存储在 `frontend/data/sample_products.json` 文件中，您可以直接编辑该文件来添加、修改或删除商品。

**商品数据格式**：

```json
{
  "id": "prod_0001",
  "title": "商品名称",
  "price": 999.99,
  "rating": 4.5,
  "rating_count": "1,234 ratings",
  "image_url": "https://example.com/image.jpg",
  "sponsored": false,
  "best_seller": false,
  "overall_pick": false,
  "limited_time": false,
  "discounted": false,
  "low_stock": false,
  "stock_quantity": null
}
```

## 🎨 前端开发

### 修改样式

编辑 `frontend/static/css/style.css` 文件来自定义界面样式。

### 修改模板

- `frontend/templates/search.html`：首页模板
- `frontend/templates/results.html`：搜索结果页模板

模板使用 Jinja2 语法，支持变量替换、循环、条件判断等功能。

## 📦 依赖说明

### 核心依赖

| 包名 | 版本 | 说明 |
|------|------|------|
| fastapi | 0.115.12 | 现代化的Web框架 |
| uvicorn | 0.34.3 | ASGI服务器 |
| jinja2 | 3.1.6 | 模板引擎 |
| python-multipart | 0.0.20 | 表单数据解析 |
| pydantic | 2.10.6 | 数据验证 |

### 安装指定版本

```bash
pip install fastapi==0.115.12 uvicorn[standard]==0.34.3
```

## 🔍 功能特性详解

### 1. 商品标签系统

商品支持多种标签类型，模拟真实电商场景：

- **Sponsored**：赞助商品
- **Best Seller**：畅销商品
- **Overall Pick**：精选推荐
- **Limited Time Offer**：限时优惠
- **Discounted**：打折商品
- **Low Stock**：库存紧张

### 2. 排序功能

支持四种排序方式：

- **最佳匹配（similarity）**：默认排序
- **价格从低到高（price_asc）**
- **价格从高到低（price_desc）**
- **评分最高（rating）**

### 3. 过滤功能

支持按价格范围和评分过滤商品：

```http
GET /api/products?min_price=100&max_price=1000&min_rating=4.0
```

### 4. 分页导航

每页显示固定数量商品（默认30个），支持上一页/下一页导航。

## 🌐 部署说明

### 开发环境

```bash
python3 app.py
```

### 生产环境

使用 gunicorn + uvicorn workers：

```bash
pip install gunicorn
gunicorn app:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:1234
```

### Docker部署（可选）

创建 `Dockerfile`：

```dockerfile
FROM python:3.12-slim

WORKDIR /app

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ ./backend/
COPY frontend/ ./frontend/

WORKDIR /app/backend

EXPOSE 1234

CMD ["python", "app.py"]
```

构建并运行：

```bash
docker build -t shop-mock .
docker run -p 1234:1234 shop-mock
```

## 🧪 测试

### 健康检查

```bash
curl http://localhost:1234/health
```

### 测试搜索API

```bash
curl "http://localhost:1234/api/products?q=laptop&sort=price_asc&page=1"
```

## 🐛 常见问题

### 1. 端口被占用

错误信息：`[Errno 98] Address already in use`

解决方法：
```bash
# 查找占用1234端口的进程
lsof -i :1234

# 终止进程
kill -9 <PID>

# 或者修改应用端口
```

### 2. 依赖安装失败

确保使用 Python 3.8+：

```bash
python3 --version
pip3 install --upgrade pip
```

### 3. 图片无法加载

示例数据使用 picsum.photos 提供的随机图片。如果无法加载，可以：
- 替换为本地图片路径
- 使用其他图片CDN服务
- 启用默认占位图（已在代码中实现）

## 📝 开发计划

- [ ] 添加用户认证系统
- [ ] 实现真实的购物车功能
- [ ] 添加商品详情页
- [ ] 支持多语言
- [ ] 添加搜索建议
- [ ] 实现商品评价系统

## 📄 许可证

本项目基于 MIT 许可证开源。

## 🙏 致谢

本项目基于 ACES (Agentic e-CommercE Simulator) 项目的sandbox模块构建。

**ACES项目引用**：
```bibtex
@article{allouah2025aces,
  title={What is your AI Agent buying? Evaluation, Implications and Emerging Questions for Agentic e-Commerce},
  author={Allouah, Amine and Besbes, Omar and Figueroa, Josué D and Kanoria, Yash and Kumar, Akshit},
  journal={arXiv preprint arXiv:2508.02630},
  year={2025}
}
```

## 📞 支持

如有问题或建议，请提交 Issue 或联系开发团队。

Haoqing Wang, wanghaoqing@pku.edu.cn

**Happy Shopping! 🛒**
