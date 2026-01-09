@echo off
echo 启动班级网站...
echo.

REM 检查是否已安装node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo 错误: 未找到Node.js，请先安装Node.js
    pause
    exit /b 1
)

REM 检查node_modules是否存在，如果不存在则安装依赖
if not exist "node_modules" (
    echo 正在安装依赖包...
    npm install
    if errorlevel 1 (
        echo 错误: 安装依赖包失败
        pause
        exit /b 1
    )
    echo 依赖包安装完成
    echo.
)

echo 正在启动班级网站服务器...
echo 您可以通过 http://localhost:3000 访问网站
echo 管理页面: http://localhost:3000/admin
echo.
echo 按 Ctrl+C 可停止服务器

REM 启动服务器
node server.js