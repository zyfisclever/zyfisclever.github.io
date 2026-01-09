const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const CryptoJS = require('crypto-js');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static('public'));

// 将静态文件服务指向正确的目录
app.use(express.static(path.join(__dirname)));

// 注册限制文件路径
const registerFilePath = path.join(__dirname, 'register.txt');
const adminFilePath = path.join(__dirname, 'admin.txt');

// AES加密密钥（实际应用中应更安全地管理）
const SECRET_KEY = 'ClassWebsiteSecretKey2023';

// 加密函数
function encryptPassword(password) {
    return CryptoJS.AES.encrypt(password, SECRET_KEY).toString();
}

// 解密函数
function decryptPassword(encryptedPassword) {
    const bytes = CryptoJS.AES.decrypt(encryptedPassword, SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
}

// 验证密码强度
function validatePassword(password) {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasMinLength = password.length >= 8;
    
    return hasUpperCase && hasLowerCase && hasNumbers && hasMinLength;
}

// 检查用户名是否在注册列表中
function isUserAllowed(username) {
    if (!fs.existsSync(registerFilePath)) {
        return false; // 如果文件不存在，不允许注册
    }
    
    const allowedUsers = fs.readFileSync(registerFilePath, 'utf8');
    const users = allowedUsers.split('\n').map(user => user.trim()).filter(user => user !== '');
    return users.includes(username);
}

// 检查是否为管理员
function isAdmin(username) {
    if (!fs.existsSync(adminFilePath)) {
        return false; // 如果文件不存在，不是管理员
    }
    
    const adminUsers = fs.readFileSync(adminFilePath, 'utf8');
    const users = adminUsers.split('\n').map(user => user.trim()).filter(user => user !== '');
    return users.includes(username);
}

// 检查用户是否已存在（这里简单地读取一个用户文件）
function isUserExists(username) {
    const usersFilePath = path.join(__dirname, 'users.txt');
    if (!fs.existsSync(usersFilePath)) {
        return false;
    }
    
    const allUsers = fs.readFileSync(usersFilePath, 'utf8');
    const users = allUsers.split('\n').map(user => user.split(':')[0]).filter(user => user !== '');
    return users.includes(username);
}

// 保存用户
function saveUser(username, encryptedPassword) {
    const usersFilePath = path.join(__dirname, 'users.txt');
    const userData = `${username}:${encryptedPassword}\n`;
    
    fs.appendFileSync(usersFilePath, userData);
}

// 验证用户登录
function validateUser(username, password) {
    const usersFilePath = path.join(__dirname, 'users.txt');
    if (!fs.existsSync(usersFilePath)) {
        return false;
    }
    
    const allUsers = fs.readFileSync(usersFilePath, 'utf8');
    const users = allUsers.split('\n').filter(user => user !== '');
    
    for (const user of users) {
        const [storedUsername, storedPassword] = user.split(':');
        if (storedUsername === username) {
            // 解密存储的密码并比较
            const decryptedPassword = decryptPassword(storedPassword);
            return decryptedPassword === password;
        }
    }
    
    return false;
}

// API路由
// 注册
app.post('/api/register', (req, res) => {
    const { username, password } = req.body;
    
    // 验证密码强度
    if (!validatePassword(password)) {
        return res.status(400).json({ message: '密码必须至少8位，包含大写字母、小写字母和数字' });
    }
    
    // 检查用户是否在允许注册的列表中
    if (!isUserAllowed(username)) {
        return res.status(403).json({ message: '您不在允许注册的用户列表中' });
    }
    
    // 检查用户是否已存在
    if (isUserExists(username)) {
        return res.status(409).json({ message: '用户名已存在' });
    }
    
    // 加密密码并保存用户
    const encryptedPassword = encryptPassword(password);
    saveUser(username, encryptedPassword);
    
    res.status(200).json({ message: '注册成功' });
});

// 登录
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    
    if (validateUser(username, password)) {
        // 设置cookie
        res.cookie('username', username, { maxAge: 24 * 60 * 60 * 1000, httpOnly: true }); // 保存1天
        res.cookie('isLoggedIn', 'true', { maxAge: 24 * 60 * 60 * 1000, httpOnly: true });
        
        // 检查是否为管理员
        if (isAdmin(username)) {
            res.cookie('isAdmin', 'true', { maxAge: 24 * 60 * 60 * 1000, httpOnly: true });
        }
        
        res.status(200).json({ message: '登录成功', isAdmin: isAdmin(username) });
    } else {
        res.status(401).json({ message: '用户名或密码错误' });
    }
});

// 检查登录状态
app.get('/api/check-auth', (req, res) => {
    const username = req.cookies.username;
    const isLoggedIn = req.cookies.isLoggedIn;
    
    if (username && isLoggedIn === 'true') {
        res.status(200).json({ 
            isLoggedIn: true, 
            username: username,
            isAdmin: req.cookies.isAdmin === 'true'
        });
    } else {
        res.status(200).json({ isLoggedIn: false });
    }
});

// 管理员检查中间件
function requireAdmin(req, res, next) {
    const username = req.cookies.username;
    const isLoggedIn = req.cookies.isLoggedIn;
    const isAdminUser = req.cookies.isAdmin;
    
    if (username && isLoggedIn === 'true' && isAdminUser === 'true') {
        next();
    } else {
        res.status(403).json({ message: '需要管理员权限' });
    }
}

// 管理员路由
app.get('/admin/*', (req, res) => {
    // 重定向到admin.html
    res.sendFile(path.join(__dirname, 'admin', 'admin.html'));
});

// 管理员API路由示例
app.get('/api/admin/users', requireAdmin, (req, res) => {
    // 返回用户列表的逻辑
    res.status(200).json({ message: '管理员用户列表' });
});

// 新闻和趣事相关路由
const newsFilePath = path.join(__dirname, 'news.txt');
const funFilePath = path.join(__dirname, 'fun.txt');

// 读取新闻内容
app.get('/api/news', (req, res) => {
    if (!fs.existsSync(newsFilePath)) {
        return res.status(200).json({ news: [] });
    }
    
    try {
        const newsContent = fs.readFileSync(newsFilePath, 'utf8');
        const newsArray = newsContent.split('\n---\n').filter(item => item.trim() !== '');
        const newsList = newsArray.map((item, index) => {
            const lines = item.split('\n');
            return {
                id: index,
                title: lines[0] || '无标题',
                content: lines.slice(1).join('\n') || '',
                date: lines[2] ? lines[2].replace('Date: ', '') : new Date().toLocaleDateString('zh-CN')
            };
        }).reverse(); // 最新的在前面
        
        res.status(200).json({ news: newsList });
    } catch (error) {
        console.error('读取新闻文件错误:', error);
        res.status(500).json({ error: '读取新闻失败' });
    }
});

// 读取趣事内容
app.get('/api/fun', (req, res) => {
    if (!fs.existsSync(funFilePath)) {
        return res.status(200).json({ fun: [] });
    }
    
    try {
        const funContent = fs.readFileSync(funFilePath, 'utf8');
        const funArray = funContent.split('\n---\n').filter(item => item.trim() !== '');
        const funList = funArray.map((item, index) => {
            const lines = item.split('\n');
            return {
                id: index,
                title: lines[0] || '无标题',
                content: lines.slice(1).join('\n') || '',
                date: lines[2] ? lines[2].replace('Date: ', '') : new Date().toLocaleDateString('zh-CN')
            };
        }).reverse(); // 最新的在前面
        
        res.status(200).json({ fun: funList });
    } catch (error) {
        console.error('读取趣事文件错误:', error);
        res.status(500).json({ error: '读取趣事失败' });
    }
});

// 管理员添加新闻（需要管理员权限）
app.post('/api/news', requireAdmin, (req, res) => {
    const { title, content } = req.body;
    
    if (!title || !content) {
        return res.status(400).json({ message: '标题和内容不能为空' });
    }
    
    const newsEntry = `${title}\n${content}\nDate: ${new Date().toLocaleDateString('zh-CN')}\n`;
    
    try {
        if (fs.existsSync(newsFilePath)) {
            const existingContent = fs.readFileSync(newsFilePath, 'utf8');
            fs.writeFileSync(newsFilePath, existingContent + '\n---\n' + newsEntry);
        } else {
            fs.writeFileSync(newsFilePath, newsEntry);
        }
        
        res.status(200).json({ message: '新闻添加成功' });
    } catch (error) {
        console.error('写入新闻文件错误:', error);
        res.status(500).json({ error: '添加新闻失败' });
    }
});

// 管理员添加趣事（需要管理员权限）
app.post('/api/fun', requireAdmin, (req, res) => {
    const { title, content } = req.body;
    
    if (!title || !content) {
        return res.status(400).json({ message: '标题和内容不能为空' });
    }
    
    const funEntry = `${title}\n${content}\nDate: ${new Date().toLocaleDateString('zh-CN')}\n`;
    
    try {
        if (fs.existsSync(funFilePath)) {
            const existingContent = fs.readFileSync(funFilePath, 'utf8');
            fs.writeFileSync(funFilePath, existingContent + '\n---\n' + funEntry);
        } else {
            fs.writeFileSync(funFilePath, funEntry);
        }
        
        res.status(200).json({ message: '趣事添加成功' });
    } catch (error) {
        console.error('写入趣事文件错误:', error);
        res.status(500).json({ error: '添加趣事失败' });
    }
});

// 聊天功能相关路由
const chatFilePath = path.join(__dirname, 'chat.txt');

// 保存聊天消息
function saveChatMessage(username, message) {
    const chatEntry = `${username}|${message}|${new Date().toISOString()}\n`;
    
    try {
        fs.appendFileSync(chatFilePath, chatEntry);
    } catch (error) {
        console.error('保存聊天消息错误:', error);
    }
}

// 获取聊天消息
app.get('/api/chat', (req, res) => {
    if (!fs.existsSync(chatFilePath)) {
        return res.status(200).json({ messages: [] });
    }
    
    try {
        const chatContent = fs.readFileSync(chatFilePath, 'utf8');
        const chatLines = chatContent.split('\n').filter(line => line.trim() !== '');
        const messages = chatLines.map(line => {
            const parts = line.split('|');
            if (parts.length >= 3) {
                return {
                    username: parts[0],
                    message: parts[1],
                    timestamp: new Date(parts[2]).toLocaleString('zh-CN'),
                    time: new Date(parts[2]).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
                };
            }
            return null;
        }).filter(msg => msg !== null); // 过滤掉解析失败的消息

        res.status(200).json({ messages: messages });
    } catch (error) {
        console.error('读取聊天文件错误:', error);
        res.status(500).json({ error: '读取聊天记录失败' });
    }
});

// 发送聊天消息
app.post('/api/chat', (req, res) => {
    const { username, message } = req.body;
    const isLoggedIn = req.cookies.isLoggedIn;
    
    if (!isLoggedIn || isLoggedIn !== 'true' || !username || !message) {
        return res.status(401).json({ message: '未登录或消息内容为空' });
    }

    // 检查用户名是否与登录用户匹配
    const loggedUsername = req.cookies.username;
    if (username !== loggedUsername) {
        return res.status(403).json({ message: '用户名与登录用户不匹配' });
    }

    try {
        saveChatMessage(username, message);
        res.status(200).json({ message: '消息发送成功' });
    } catch (error) {
        console.error('保存消息错误:', error);
        res.status(500).json({ error: '发送消息失败' });
    }
});

// 提供主页
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`班级网站服务器运行在 http://localhost:${PORT}`);
    console.log(`管理页面访问地址: http://localhost:${PORT}/admin`);
});