const http = require('http');

// 测试获取聊天消息API
function testGetChatMessages() {
    console.log('测试获取聊天消息API...');
    
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
            console.log('获取聊天消息API测试完成\n');
        });
    });

    req.on('error', (error) => {
        console.error('请求失败:', error);
    });
    
    req.end();
}

// 稍等一下让服务器完全启动后再测试
setTimeout(testGetChatMessages, 3000);