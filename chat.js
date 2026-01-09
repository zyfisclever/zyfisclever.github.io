document.addEventListener('DOMContentLoaded', function() {
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    const chatMessages = document.querySelector('.chat-messages');
    
    // 检查登录状态
    async function checkAuth() {
        try {
            const response = await fetch('/api/check-auth');
            const data = await response.json();
            return data.isLoggedIn ? data.username : null;
        } catch (error) {
            console.error('检查登录状态失败:', error);
            return null;
        }
    }
    
    // 获取历史聊天消息
    async function loadChatHistory() {
        try {
            const response = await fetch('/api/chat');
            const data = await response.json();
            
            if (data.messages && data.messages.length > 0) {
                chatMessages.innerHTML = ''; // 清空当前消息
                
                data.messages.forEach(msg => {
                    const messageElement = createMessageElement(msg.username, msg.message, msg.time, msg.username);
                    chatMessages.appendChild(messageElement);
                });
            }
        } catch (error) {
            console.error('加载聊天历史失败:', error);
        }
    }
    
    // 创建消息元素
    function createMessageElement(username, message, time, sender) {
        const messageElement = document.createElement('div');
        
        // 检查是否是当前用户的消息
        const currentUsername = document.body.getAttribute('data-username');
        if (sender === currentUsername) {
            messageElement.classList.add('message', 'from-me');
        } else {
            messageElement.classList.add('message', 'from-them');
        }
        
        const messageText = document.createElement('p');
        messageText.textContent = `[${username}] ${message}`;
        
        const timeSpan = document.createElement('span');
        timeSpan.classList.add('time');
        timeSpan.textContent = time;
        
        messageElement.appendChild(messageText);
        messageElement.appendChild(timeSpan);
        
        return messageElement;
    }
    
    // 发送消息到服务器
    async function sendMessage() {
        const message = messageInput.value.trim();
        if (!message) return;
        
        const username = document.body.getAttribute('data-username');
        if (!username) {
            alert('请先登录');
            window.location.href = 'login.html';
            return;
        }
        
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, message })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // 清空输入框
                messageInput.value = '';
                
                // 重新加载聊天历史以显示新消息
                await loadChatHistory();
            } else {
                alert(data.message || '发送消息失败');
            }
        } catch (error) {
            console.error('发送消息失败:', error);
            alert('发送消息失败，请重试');
        }
    }
    
    // 初始化聊天功能
    async function initChat() {
        const username = await checkAuth();
        if (username) {
            document.body.setAttribute('data-username', username);
            await loadChatHistory();
        } else {
            alert('请先登录');
            window.location.href = 'login.html';
            return;
        }
    }
    
    // 更新消息发送功能
    sendButton.addEventListener('click', sendMessage);
    
    messageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    // 初始化聊天
    initChat();
});