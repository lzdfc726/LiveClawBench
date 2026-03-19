#!/bin/bash

# E-Commerce Mosi Shop Backend Startup Script

echo "=================================="
echo "E-Commerce Mosi Shop Backend"
echo "=================================="

# 检查Python环境
if ! command -v python3 &> /dev/null; then
    echo "错误: 未找到Python3，请先安装Python 3.8+"
    exit 1
fi

# 检查依赖是否安装
if ! python3 -c "import fastapi" 2>/dev/null; then
    echo "正在安装依赖..."
    pip install -r requirements.txt
fi

# 检查端口占用
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

        if netstat -tunlp 2>/dev/null | grep -q ":$PORT " || ss -tunlp 2>/dev/null | grep -q ":$PORT "; then
            echo "❌ 无法释放端口，请手动处理: kill $PID"
            exit 1
        fi
        echo "✓ 端口已释放"
    fi
fi

# 启动服务
echo "启动服务..."
echo "访问地址: http://localhost:1234"
echo "API文档: http://localhost:1234/docs"
echo ""

python3 app.py
