#!/bin/bash

# E-Commerce Mosi Shop One-Click Startup Script

echo "=========================================="
echo "  E-Commerce Mosi Shop - Quick Start"
echo "=========================================="

# 检查Python环境
if ! command -v python3 &> /dev/null; then
    echo "❌ 错误: 未找到Python3，请先安装Python 3.8+"
    exit 1
fi

echo "✓ Python版本: $(python3 --version)"

# 进入后端目录
cd backend

# 检查并安装依赖
echo ""
echo "检查依赖..."
if ! python3 -c "import fastapi" 2>/dev/null; then
    echo "正在安装依赖包..."
    pip3 install -q -r requirements.txt
    if [ $? -eq 0 ]; then
        echo "✓ 依赖安装成功"
    else
        echo "❌ 依赖安装失败"
        exit 1
    fi
else
    echo "✓ 依赖已安装"
fi

# 检查数据文件
if [ ! -f "../frontend/data/sample_products.json" ]; then
    echo "⚠️  警告: 示例数据文件不存在"
else
    product_count=$(python3 -c "import json; print(len(json.load(open('../frontend/data/sample_products.json'))))")
    echo "✓ 数据文件就绪: $product_count 个商品"
fi

echo ""
echo "=========================================="
echo "  启动服务"
echo "=========================================="

# 检查端口是否被占用
PORT=1234
if netstat -tunlp 2>/dev/null | grep -q ":$PORT " || ss -tunlp 2>/dev/null | grep -q ":$PORT "; then
    echo "⚠️  检测到端口 $PORT 已被占用"

    # 查找占用端口的进程
    PID=$(netstat -tunlp 2>/dev/null | grep ":$PORT " | awk '{print $7}' | cut -d'/' -f1)
    if [ -z "$PID" ]; then
        PID=$(ss -tunlp 2>/dev/null | grep ":$PORT " | grep -oP 'pid=\K[0-9]+')
    fi

    if [ -n "$PID" ]; then
        echo "   正在终止旧进程 (PID: $PID)..."
        kill $PID 2>/dev/null
        sleep 2

        # 确认端口已释放
        if netstat -tunlp 2>/dev/null | grep -q ":$PORT " || ss -tunlp 2>/dev/null | grep -q ":$PORT "; then
            echo "❌ 无法释放端口 $PORT，请手动处理"
            exit 1
        else
            echo "✓ 端口已释放"
        fi
    fi
    echo ""
fi

echo "访问地址:"
echo "  • 主页:    http://localhost:1234"
echo "  • API文档: http://localhost:1234/docs"
echo ""
echo "按 Ctrl+C 停止服务"
echo "=========================================="
echo ""

# 启动服务
python3 app.py
