# Build estático do frontend Vite + React
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
COPY pnpm-lock.yaml* ./
RUN npm install
COPY . .
ARG VITE_API_URL=https://api.example.com
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

FROM nginx:1.27-alpine
COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
