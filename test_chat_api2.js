const http = require('http');
const querystring = require('querystring');

// 模拟发送聊天消息
function testSendChatMessage() {
    console.log('测试发送聊天消息API...');
    
    const postData = JSON.stringify({
        username: 'testuser',
        message: '这是一条测试消息'
    });

    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/chat',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': postData.length
        }
    };

    const req = http.request(options, (res) => {
        console.log(`状态码: ${res.statusCode}`);
        
        res.on('data', (chunk) => {
            console.log(`响应内容: ${chunk}`);
        });
        
        res.on('end', () => {
            console.log('发送消息API测试完成\n');
            // 稍后再次获取消息以验证消息是否已保存
            setTimeout(testGetChatMessages, 1000);
        });
    });

    req.on('error', (error) => {
        console.error('请求失败:', error);
    });
    
    req.write(postData);
    req.end();
}

// 测试获取聊天消息API
function testGetChatMessages() {
    console.log('再次测试获取聊天消息API...');
    
    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/chat',
        method: 'GET',
    };

    const req = http.get(options, (res) => {
        console.log(`状态码: ${res.statusCode}`);
        
        res.on('data', (chunk) => {
            console.log(`响应内容: ${chunk}`);
        });
        
        res.on('end', () => {
            console.log('获取聊天消息API测试完成');
            console.log('测试结束');
        });
    });

    req.on('error', (error) => {
        console.error('请求失败:', error);
    });
    
    req.end();
}

setTimeout(testSendChatMessage, 2000);