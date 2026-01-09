document.addEventListener('DOMContentLoaded', function() {
    // 检查是否为管理员
    async function checkAdminStatus() {
        try {
            const response = await fetch('/api/check-auth');
            const data = await response.json();
            
            if (!data.isLoggedIn || !data.isAdmin) {
                alert('需要管理员权限才能访问此页面');
                window.location.href = '../login.html';
            }
        } catch (error) {
            console.error('检查管理员状态失败:', error);
            window.location.href = '../login.html';
        }
    }
    
    // 只有在管理员页面才检查权限
    if (window.location.pathname.includes('/admin')) {
        checkAdminStatus();
    }
    
    // 管理员功能按钮事件
    const newsBtn = document.getElementById('newsBtn');
    const funBtn = document.getElementById('funBtn');
    const homeworkBtn = document.getElementById('homeworkBtn');
    const answersBtn = document.getElementById('answersBtn');
    const usersBtn = document.getElementById('usersBtn');
    
    const newsManagement = document.getElementById('newsManagement');
    const funManagement = document.getElementById('funManagement');
    
    if (newsBtn) {
        newsBtn.addEventListener('click', function() {
            newsManagement.style.display = 'block';
            funManagement.style.display = 'none';
        });
    }
    
    if (funBtn) {
        funBtn.addEventListener('click', function() {
            funManagement.style.display = 'block';
            newsManagement.style.display = 'none';
        });
    }
    
    // 新闻表单提交
    const newsForm = document.getElementById('newsForm');
    if (newsForm) {
        newsForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const title = document.getElementById('newsTitle').value;
            const content = document.getElementById('newsContent').value;
            
            try {
                const response = await fetch('/api/news', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ title, content })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    alert('新闻发布成功');
                    // 清空表单
                    newsForm.reset();
                } else {
                    alert(`发布失败: ${data.message || '未知错误'}`);
                }
            } catch (error) {
                console.error('发布新闻失败:', error);
                alert('发布新闻失败，请检查网络连接');
            }
        });
    }
    
    // 趣事表单提交
    const funForm = document.getElementById('funForm');
    if (funForm) {
        funForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const title = document.getElementById('funTitle').value;
            const content = document.getElementById('funContent').value;
            
            try {
                const response = await fetch('/api/fun', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ title, content })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    alert('趣事发布成功');
                    // 清空表单
                    funForm.reset();
                } else {
                    alert(`发布失败: ${data.message || '未知错误'}`);
                }
            } catch (error) {
                console.error('发布趣事失败:', error);
                alert('发布趣事失败，请检查网络连接');
            }
        });
    }
});