# ---- build ----
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build

# ---- run ----
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
# cache básico e SPA fallback
RUN printf "server { \
    listen 80; \
    server_name _; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { try_files \$uri /index.html; } \
    location /health { return 200 'ok'; add_header Content-Type text/plain; } \
}\n" > /etc/nginx/conf.d/default.conf
EXPOSE 80
    