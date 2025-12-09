# Sử dụng Nginx Alpine - image nhẹ
FROM nginx:alpine

# Copy tất cả các file cần thiết vào thư mục mặc định của Nginx
COPY shipSimulator.html /usr/share/nginx/html/index.html
COPY config.js /usr/share/nginx/html/config.js
COPY app.js /usr/share/nginx/html/app.js

# Expose port 8022
EXPOSE 8022

# Nginx sẽ tự động chạy khi container start
CMD ["nginx", "-g", "daemon off;"]