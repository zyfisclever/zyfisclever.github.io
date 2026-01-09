document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            // 检查密码确认
            if (password !== confirmPassword) {
                alert('两次输入的密码不一致');
                return;
            }
            
            try {
                const response = await fetch('/api/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, password })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    alert('注册成功！请登录');
                    window.location.href = 'login.html';
                } else {
                    alert(data.message || '注册失败');
                }
            } catch (error) {
                console.error('注册请求失败:', error);
                alert('网络错误，请稍后重试');
            }
        });
    }
});