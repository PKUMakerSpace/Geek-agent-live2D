#!/bin/bash

if [ "$EUID" -ne 0 ]; then
  echo "请使用 sudo 运行此脚本"
  exit 1
fi

echo "正在安装必要依赖..."
apt update
apt install -y nginx
npm install -g pm2

echo "正在部署前端..."
cd /home/zhzhou/network/geek-agent-live2d/frontend
npm install
npm run build
mkdir -p /var/www/html
cp -r dist/* /var/www/html/

echo "正在配置 Nginx..."
cat <<EOF > /etc/nginx/sites-available/default
server {
    listen 8080;
    server_name _;

    location / {
        root /var/www/html;
        index index.html;
        try_files \$uri /index.html;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

systemctl restart nginx

echo "正在部署后端..."
cd /home/zhzhou/network/geek-agent-live2d/backend
apt install -y python3.10-venv
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pm2 start main.py --name nana-backend

SERVER_IP=$(hostname -I | awk '{print $1}')

echo "部署完成！请访问 http://$SERVER_IP:8080 查看前端页面"
echo "API 访问地址：http://$SERVER_IP/api"