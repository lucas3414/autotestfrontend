FROM nginx

# 将dist文件中的内容复制到 /usr/share/nginx/html/ 这个目录下面，其中dist是相对于Dockerfile的位置
COPY dist/  /usr/share/nginx/html/

# 用本地的nginx配置替换镜像中的默认配置
COPY nginx/default.conf /etc/nginx/conf.d/default.conf