document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, password })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    alert('登录成功！');
                    // 根据是否为管理员重定向到不同页面
                    if (data.isAdmin) {
                        window.location.href = '/admin';
                    } else {
                        window.location.href = 'index.html';
                    }
                } else {
                    alert(data.message || '登录失败');
                }
            } catch (error) {
                console.error('登录请求失败:', error);
                alert('网络错误，请稍后重试');
            }
        });
    }
});