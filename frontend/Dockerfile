# ---- Build stage ----
FROM node:20-alpine AS builder
WORKDIR /app

# 1️⃣ Copy dependency manifests first for better caching
COPY package*.json ./

# 2️⃣ Install dependencies (including vite + plugin)
RUN npm install
RUN npm install -D vite @vitejs/plugin-react

# 3️⃣ Copy source code and build
COPY . .
RUN npm run build

# ---- Runtime stage ----
FROM nginx:1.25-alpine
WORKDIR /usr/share/nginx/html

# 4️⃣ Copy compiled site into Nginx
COPY --from=builder /app/dist .
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 5️⃣ Health & defaults
EXPOSE 80
HEALTHCHECK CMD wget --spider -q localhost || exit 1
CMD ["nginx", "-g", "daemon off;"]
