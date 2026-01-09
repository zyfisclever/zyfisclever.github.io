PATH=/www/server/nodejs/v16.9.0/bin:/bin:/sbin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin:~/bin
export PATH

export 
export NODE_PROJECT_NAME="My_Class_Website"
cd /media/zyfisclever/6E3E1DB13E1D72F7/Users/Admin/Desktop/新建文件夹/class_website - 副本
nohup /www/server/nodejs/v16.9.0/bin/node /media/zyfisclever/6E3E1DB13E1D72F7/Users/Admin/Desktop/新建文件夹/class_website - 副本/server.js  &>> /www/wwwlogs/nodejs/My_Class_Website.log &
echo $! > /www/server/nodejs/vhost/pids/My_Class_Website.pid
