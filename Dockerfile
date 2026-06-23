FROM nginx:alpine
COPY index.html /usr/share/nginx/html/
COPY estilo.css /usr/share/nginx/html/
COPY app.js /usr/share/nginx/html/
COPY audicao-app/public/ /usr/share/nginx/html/
EXPOSE 80
