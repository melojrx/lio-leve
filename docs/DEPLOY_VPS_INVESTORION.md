# 🚀 Deploy investiorion.com.br na VPS - Guia de Implementação

**Data de Criação:** 21 de Novembro de 2025  
**Versão:** 1.0 - Planejamento e Integração  
**Aplicação:** investiorion.com.br - Plataforma de Investimentos

## 📋 Índice

1. [Visão Geral](#-visão-geral)
2. [Arquitetura Proposta](#-arquitetura-proposta)
3. [Stack Tecnológica](#-stack-tecnológica)
4. [Estrutura de Containers](#-estrutura-de-containers)
5. [Configuração de Redes](#-configuração-de-redes)
6. [Configuração SSL/TLS](#-configuração-ssltls)
7. [Scripts de Deploy](#-scripts-de-deploy)
8. [Variáveis de Ambiente](#-variáveis-de-ambiente)
9. [Processo de Implementação](#-processo-de-implementação)
10. [Monitoramento e Manutenção](#-monitoramento-e-manutenção)
11. [Troubleshooting](#-troubleshooting)

---

## 🎯 Visão Geral

### Objetivo
Integrar a aplicação **investiorion.com.br** na VPS existente (31.97.17.10) que já hospeda **necessito.online** e **urbanlive.com.br**, mantendo o isolamento entre as aplicações e aproveitando a infraestrutura SSL/TLS centralizada.

### Características da Aplicação
- **Domínio:** investiorion.com.br
- **Frontend:** React 18 + Vite + TypeScript + Tailwind CSS + shadcn/ui
- **Backend:** FastAPI + SQLAlchemy + Alembic
- **Banco de Dados:** PostgreSQL 15
- **Cache/Queue:** Redis 7 + Celery
- **Servidor Web:** Nginx

### Status do Projeto
- ✅ Código desenvolvido localmente
- ✅ Docker Compose configurado para desenvolvimento
- ✅ Migrações com Alembic funcionais
- 🔄 **Pendente:** Adaptação para produção e deploy na VPS

---

## 🏗️ Arquitetura Proposta

```
Internet (HTTPS/443 | HTTP/80)
            ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                         NGINX GLOBAL (SSL/TLS)                          │
│                     Container: nginx-global                             │
│                 Rede: nginx-global_global-network                       │
│              Certificados Let's Encrypt                                │
│                                                                         │
│  ┌──────────────────┐  ┌──────────────────┐  ┌─────────────────────┐  │
│  │ necessito.online │  │ urbanlive.com.br │  │ investiorion.com.br │  │
│  │ proxy_pass →     │  │ proxy_pass →     │  │ proxy_pass →        │  │
│  │ nginx-necessito  │  │ urbanlive_web    │  │ investorion-web     │  │
│  └──────────────────┘  └──────────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                                        │
                                                        ▼
                                        ┌──────────────────────────────────┐
                                        │   INVESTORION APP                │
                                        │   💰 Plataforma de Investimentos  │
                                        │                                  │
                                        │ ┌──────────────────────────────┐ │
                                        │ │ investorion-web              │ │
                                        │ │ Nginx Alpine                 │ │
                                        │ │ Porta: 80 (interna)         │ │
                                        │ │ Servindo build React/Vite   │ │
                                        │ └──────────────────────────────┘ │
                                        │              ↓                   │
                                        │ ┌──────────────────────────────┐ │
                                        │ │ investorion-api              │ │
                                        │ │ FastAPI + Uvicorn            │ │
                                        │ │ Porta: 8000 (interna)       │ │
                                        │ └──────────────────────────────┘ │
                                        │              ↓                   │
                                        │ ┌──────────────────────────────┐ │
                                        │ │ investorion-db               │ │
                                        │ │ PostgreSQL 15                │ │
                                        │ │ Porta: 5432 (interna)       │ │
                                        │ └──────────────────────────────┘ │
                                        │              ↓                   │
                                        │ ┌──────────────────────────────┐ │
                                        │ │ investorion-redis            │ │
                                        │ │ Redis 7-alpine               │ │
                                        │ │ Porta: 6379 (interna)       │ │
                                        │ └──────────────────────────────┘ │
                                        │              ↓                   │
                                        │ ┌──────────────────────────────┐ │
                                        │ │ investorion-worker           │ │
                                        │ │ Celery Worker                │ │
                                        │ │ (Jobs de cotações)           │ │
                                        │ └──────────────────────────────┘ │
                                        └──────────────────────────────────┘
```

---

## 💻 Stack Tecnológica

### Frontend
| Tecnologia | Versão | Função |
|------------|--------|--------|
| React | 18.3.1 | Framework UI |
| TypeScript | 5.8.3 | Tipagem estática |
| Vite | 5.4.19 | Build tool e dev server |
| Tailwind CSS | 3.4.17 | Framework CSS |
| shadcn/ui | latest | Componentes UI |
| React Router | 6.30.1 | Roteamento SPA |
| TanStack Query | 5.83.0 | Gerenciamento de estado server |
| Recharts | 2.15.4 | Gráficos e visualizações |

### Backend
| Tecnologia | Versão | Função |
|------------|--------|--------|
| Python | 3.11 | Linguagem base |
| FastAPI | latest | Framework web assíncrono |
| SQLAlchemy | latest | ORM |
| Alembic | latest | Migrações de banco |
| Uvicorn | latest | ASGI server |
| Pydantic | latest | Validação de dados |
| Celery | latest | Task queue |

### Infraestrutura
| Serviço | Imagem Docker | Função |
|---------|---------------|--------|
| PostgreSQL | postgres:15 | Banco de dados relacional |
| Redis | redis:7-alpine | Cache e message broker |
| Nginx | nginx:1.27-alpine | Servidor web estático |

---

## 📦 Estrutura de Containers

### Docker Compose para Produção

Será necessário criar um arquivo `docker-compose.prod.yml` seguindo o padrão das outras aplicações:

```yaml
version: "3.9"

services:
  db:
    image: postgres:15
    container_name: investorion-db
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - investorion_db_data:/var/lib/postgresql/data
      - ./backups:/backups
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - investorion_app_network

  redis:
    image: redis:7-alpine
    container_name: investorion-redis
    restart: unless-stopped
    command: redis-server --appendonly yes
    volumes:
      - investorion_redis_data:/data
    networks:
      - investorion_app_network

  api:
    image: ${REGISTRY_IMAGE:-investorion-api}:${IMAGE_TAG:-latest}
    container_name: investorion-api
    restart: unless-stopped
    env_file:
      - .env.prod
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
    volumes:
      - ./media:/app/media
      - ./logs:/app/logs
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - investorion_app_network

  worker:
    image: ${REGISTRY_IMAGE:-investorion-api}:${IMAGE_TAG:-latest}
    container_name: investorion-worker
    restart: unless-stopped
    env_file:
      - .env.prod
    command: celery -A app.worker.celery_app worker -l info
    volumes:
      - ./media:/app/media
      - ./logs:/app/logs
    depends_on:
      - api
      - redis
    networks:
      - investorion_app_network

  web:
    image: ${REGISTRY_WEB_IMAGE:-investorion-web}:${IMAGE_TAG:-latest}
    container_name: investorion-web
    restart: unless-stopped
    depends_on:
      - api
    networks:
      - investorion_app_network
      - nginx-global_global-network

networks:
  investorion_app_network:
    driver: bridge
    name: investorion_app_network
  nginx-global_global-network:
    external: true
    name: nginx-global_global-network

volumes:
  investorion_db_data:
  investorion_redis_data:
```

---

## 🌐 Configuração de Redes

### Redes Docker

| Rede | Tipo | Função | Containers |
|------|------|--------|------------|
| nginx-global_global-network | Bridge (externa) | Proxy reverso | nginx-global, investorion-web |
| investorion_app_network | Bridge (interna) | Comunicação interna da app | api, db, redis, worker, web |

### Conectividade

```bash
# Verificar conectividade do nginx-global com a nova aplicação
docker exec nginx-global ping -c 1 investorion-web

# Verificar conectividade interna
docker exec investorion-api curl http://investorion-web/
```

---

## 🔐 Configuração SSL/TLS

### Certificado Let's Encrypt

O certificado será gerenciado pelo nginx-global existente. Será necessário:

1. **Adicionar configuração no nginx-global**

Criar arquivo `/root/nginx-global/conf/investorion.conf`:

```nginx
# HTTP - Redirecionamento para HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name investiorion.com.br www.investiorion.com.br;
    
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS - Configuração Principal
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name investiorion.com.br www.investiorion.com.br;
    
    # Certificados SSL
    ssl_certificate /etc/letsencrypt/live/investiorion.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/investiorion.com.br/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
    
    # Headers de Segurança
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "same-origin" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Logs
    access_log /var/log/nginx/investorion_access.log;
    error_log /var/log/nginx/investorion_error.log;
    
    # Client max body size (uploads)
    client_max_body_size 10M;
    
    # Proxy para container web (Nginx interno)
    location / {
        proxy_pass http://investorion-web/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

2. **Nginx interno da aplicação**

Criar arquivo `/root/investorion/nginx/default.conf`:

```nginx
upstream api_backend {
    server investorion-api:8000;
}

server {
    listen 80;
    server_name _;
    
    # Frontend estático (React/Vite build)
    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
        
        # Cache para assets estáticos
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # Proxy para API FastAPI
    location /api/ {
        proxy_pass http://api_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # CORS (se necessário)
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type' always;
    }
    
    # Documentação FastAPI
    location /docs {
        proxy_pass http://api_backend/docs;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # OpenAPI schema
    location /openapi.json {
        proxy_pass http://api_backend/openapi.json;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
    
    # Health check
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

3. **Obter certificado SSL**

```bash
# Parar nginx-global temporariamente
docker stop nginx-global

# Obter certificado
docker run --rm \
  -v "/root/necessito/data/certbot/conf:/etc/letsencrypt" \
  -v "/root/necessito/data/certbot/www:/var/www/certbot" \
  -p 80:80 \
  certbot/certbot certonly \
  --standalone \
  --email suporteindicaai@hotmail.com \
  --agree-tos \
  --no-eff-email \
  -d investiorion.com.br \
  -d www.investiorion.com.br

# Reiniciar nginx-global
docker start nginx-global
```

---

## 📝 Scripts de Deploy

### 1. Script de Deploy Principal

Criar arquivo `/root/investorion/scripts/deploy.sh`:

```bash
#!/bin/bash
set -e

echo "🚀 Iniciando deploy do investiorion.com.br"

# Variáveis
APP_DIR="/root/investorion"
BACKUP_DIR="$APP_DIR/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
REGISTRY_IMAGE="${REGISTRY_IMAGE:-investorion-api}"
REGISTRY_WEB_IMAGE="${REGISTRY_WEB_IMAGE:-investorion-web}"
IMAGE_TAG="${IMAGE_TAG:-latest}"

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

cd $APP_DIR

# 1. Backup do banco de dados
echo -e "${YELLOW}📦 Criando backup do banco de dados...${NC}"
./scripts/backup_db.sh

# 2. Pull das novas imagens
echo -e "${YELLOW}📥 Baixando novas imagens Docker...${NC}"
docker pull $REGISTRY_IMAGE:$IMAGE_TAG || echo "Usando imagem local"
docker pull $REGISTRY_WEB_IMAGE:$IMAGE_TAG || echo "Usando imagem local"

# 3. Aplicar migrações (sem downtime)
echo -e "${YELLOW}🔄 Aplicando migrações do banco de dados...${NC}"
docker compose -f docker-compose.prod.yml run --rm api alembic upgrade head

# 4. Deploy com zero downtime
echo -e "${YELLOW}🔄 Atualizando containers...${NC}"
docker compose -f docker-compose.prod.yml up -d --no-deps --build api worker web

# 5. Health check
echo -e "${YELLOW}🏥 Verificando saúde da aplicação...${NC}"
sleep 10

HEALTH_CHECK=$(curl -f -s https://investiorion.com.br/health/ || echo "FAILED")
if [[ "$HEALTH_CHECK" == *"healthy"* ]]; then
    echo -e "${GREEN}✅ Deploy concluído com sucesso!${NC}"
    echo -e "${GREEN}✅ Aplicação está saudável${NC}"
else
    echo -e "${RED}❌ Health check falhou! Iniciando rollback...${NC}"
    ./scripts/rollback.sh
    exit 1
fi

# 6. Limpeza de imagens antigas
echo -e "${YELLOW}🧹 Limpando imagens antigas...${NC}"
docker image prune -f

echo -e "${GREEN}🎉 Deploy finalizado - $(date)${NC}"
```

### 2. Script de Backup

Criar arquivo `/root/investorion/scripts/backup_db.sh`:

```bash
#!/bin/bash
set -e

BACKUP_DIR="/root/investorion/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/investorion_backup_$TIMESTAMP.sql"

mkdir -p "$BACKUP_DIR"

echo "📦 Criando backup do banco de dados..."

docker compose -f /root/investorion/docker-compose.prod.yml exec -T db \
  pg_dump -U postgres investorion > "$BACKUP_FILE"

gzip "$BACKUP_FILE"

echo "✅ Backup criado: ${BACKUP_FILE}.gz"

# Manter apenas os últimos 7 dias de backup
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +7 -delete

echo "🧹 Backups antigos removidos"
```

### 3. Script de Rollback

Criar arquivo `/root/investorion/scripts/rollback.sh`:

```bash
#!/bin/bash
set -e

echo "⚠️  Iniciando rollback..."

APP_DIR="/root/investorion"
cd $APP_DIR

# Reverter para última imagem estável
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d

echo "✅ Rollback concluído"
```

### 4. Script de Migração

Criar arquivo `/root/investorion/scripts/migrate.sh`:

```bash
#!/bin/bash
set -e

echo "🔄 Executando migrações..."

docker compose -f /root/investorion/docker-compose.prod.yml run --rm api \
  alembic upgrade head

echo "✅ Migrações aplicadas com sucesso"
```

### 5. Tornar scripts executáveis

```bash
chmod +x /root/investorion/scripts/*.sh
```

---

## 🔑 Variáveis de Ambiente

### Frontend (.env.prod)

Criar arquivo `/root/investorion/.env.frontend.prod`:

```bash
# Aplicação
VITE_APP_NAME=investiorion.com.br

# API (proxy via nginx interno)
VITE_API_URL=/api
```

### Backend (.env.prod)

Criar arquivo `/root/investorion/.env.prod`:

```bash
# Database
DATABASE_URL=postgresql+psycopg://investorion_user:SENHA_SEGURA@investorion-db:5432/investorion_prod
POSTGRES_DB=investorion_prod
POSTGRES_USER=investorion_user
POSTGRES_PASSWORD=SENHA_SEGURA

# Security
SECRET_KEY=CHAVE_SECRETA_256_BITS_GERADA
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_MINUTES=10080

# CORS
CORS_ORIGINS=["https://investiorion.com.br","https://www.investiorion.com.br"]

# Admin
FIRST_SUPERUSER_EMAIL=admin@investorion.com
FIRST_SUPERUSER_PASSWORD=SENHA_ADMIN_SEGURA
FIRST_SUPERUSER_FULL_NAME=Administrador Sistema

# Redis/Celery
BROKER_URL=redis://investorion-redis:6379/0
RESULT_BACKEND=redis://investorion-redis:6379/1

# Media
MEDIA_ROOT=/app/media
MEDIA_URL=/media/

# Logs
LOG_LEVEL=INFO

# Environment
ENVIRONMENT=production
```

### Gerar senhas seguras

```bash
# Gerar SECRET_KEY
openssl rand -hex 32

# Gerar senha do banco
openssl rand -base64 32
```

---

## 🚀 Processo de Implementação

### Fase 1: Preparação da VPS (1-2 horas)

#### 1.1 Criar estrutura de diretórios

```bash
# Conectar na VPS
ssh root@31.97.17.10

# Criar estrutura
mkdir -p /root/investorion/{scripts,backups,logs,media,nginx}
cd /root/investorion
```

#### 1.2 Clonar repositório ou transferir código

```bash
# Opção A: Clonar do Git (se houver repositório privado)
git clone https://github.com/melojrx/investorion.git /root/investorion

# Opção B: Transferir via SCP do local
# (executar do seu computador local)
scp -r /home/jrmelo/Projetos/lio-leve/* root@31.97.17.10:/root/investorion/
```

#### 1.3 Configurar variáveis de ambiente

```bash
cd /root/investorion

# Copiar e editar variáveis de produção
cp .env.example .env.frontend.prod
cp api/.env.docker.example .env.prod

# Editar com senhas seguras
nano .env.prod
```

### Fase 2: Build das Imagens Docker (30-60 min)

#### 2.1 Build da API

```bash
cd /root/investorion

# Build da imagem da API
docker build -f api/Dockerfile -t investorion-api:latest .
```

#### 2.2 Build do Frontend

```bash
# Build da imagem do frontend
docker build \
  -f docker/web/Dockerfile \
  --build-arg VITE_API_URL=/api \
  -t investorion-web:latest .
```

### Fase 3: Configuração do Nginx Global (15-30 min)

#### 3.1 Adicionar configuração

```bash
cd /root/nginx-global

# Criar arquivo de configuração
nano conf/investorion.conf
# (copiar conteúdo da seção SSL/TLS deste documento)
```

#### 3.2 Obter certificado SSL

```bash
# Parar nginx-global
docker stop nginx-global

# Obter certificado
docker run --rm \
  -v "/root/necessito/data/certbot/conf:/etc/letsencrypt" \
  -v "/root/necessito/data/certbot/www:/var/www/certbot" \
  -p 80:80 \
  certbot/certbot certonly \
  --standalone \
  --email suporteindicaai@hotmail.com \
  --agree-tos \
  --no-eff-email \
  -d investiorion.com.br \
  -d www.investiorion.com.br

# Reiniciar nginx-global
docker start nginx-global

# Verificar configuração
docker exec nginx-global nginx -t

# Reload se OK
docker exec nginx-global nginx -s reload
```

### Fase 4: Deploy Inicial (30-60 min)

#### 4.1 Criar docker-compose.prod.yml

```bash
cd /root/investorion
nano docker-compose.prod.yml
# (copiar conteúdo da seção Estrutura de Containers)
```

#### 4.2 Criar configuração do Nginx interno

```bash
mkdir -p /root/investorion/docker/nginx
nano /root/investorion/docker/nginx/default.conf
# (copiar conteúdo da seção SSL/TLS)
```

#### 4.3 Atualizar Dockerfile do web

```bash
nano /root/investorion/docker/web/Dockerfile
```

Garantir que o Dockerfile contém:

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
COPY pnpm-lock.yaml* ./
RUN npm install

COPY . .
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

FROM nginx:1.27-alpine
COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### 4.4 Subir os containers

```bash
cd /root/investorion

# Carregar variáveis de ambiente
set -a && source .env.prod && set +a

# Subir containers
docker compose -f docker-compose.prod.yml up -d

# Verificar status
docker ps | grep investorion
```

#### 4.5 Aplicar migrações

```bash
docker compose -f docker-compose.prod.yml run --rm api alembic upgrade head
```

#### 4.6 Criar superusuário (se necessário)

```bash
docker compose -f docker-compose.prod.yml exec api python -m app.scripts.create_superuser
```

### Fase 5: Verificação e Testes (30 min)

#### 5.1 Health checks

```bash
# Verificar conectividade interna
docker exec nginx-global ping -c 1 investorion-web

# Verificar logs
docker logs investorion-api --tail 50
docker logs investorion-web --tail 50
docker logs nginx-global --tail 50

# Verificar certificado SSL
curl -I https://investiorion.com.br

# Verificar API
curl https://investiorion.com.br/api/health
curl https://investiorion.com.br/api/v1/status
```

#### 5.2 Testes funcionais

- [ ] Acesso à homepage: https://investiorion.com.br
- [ ] Acesso à API docs: https://investiorion.com.br/docs
- [ ] Login/autenticação funcionando
- [ ] Dashboard carregando
- [ ] Endpoints da API respondendo
- [ ] Celery worker processando jobs

### Fase 6: Configuração de Backups e Monitoramento (30 min)

#### 6.1 Configurar cron para backups

```bash
# Editar crontab
crontab -e

# Adicionar:
# Backup diário às 3:00 AM
0 3 * * * /root/investorion/scripts/backup_db.sh >> /root/investorion/logs/backup.log 2>&1
```

#### 6.2 Configurar renovação de SSL

O certificado já será renovado pelo cron existente do necessito:

```bash
# Verificar cron existente
crontab -l | grep certbot

# Deve ter algo como:
# 0 0,12 * * * docker run --rm -v "/root/necessito/data/certbot/conf:/etc/letsencrypt" ...
```

---

## 📊 Monitoramento e Manutenção

### Health Checks

#### Script de Monitoramento

Criar arquivo `/root/investorion/scripts/health_check.sh`:

```bash
#!/bin/bash

check_service() {
    local url=$1
    local name=$2
    if curl -fsS "$url" > /dev/null 2>&1; then
        echo "✅ $name está funcionando"
        return 0
    else
        echo "❌ $name está com problema"
        return 1
    fi
}

echo "=== Health Check investiorion.com.br - $(date) ==="
check_service "https://investiorion.com.br/health" "Frontend"
check_service "https://investiorion.com.br/api/health" "API"

# Verificar containers
echo ""
echo "=== Status dos Containers ==="
docker ps --filter "name=investorion" --format "table {{.Names}}\t{{.Status}}"

# Verificar uso de recursos
echo ""
echo "=== Uso de Recursos ==="
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}" \
  $(docker ps --filter "name=investorion" -q)
```

### Logs

```bash
# Logs em tempo real
tail -f /root/investorion/logs/*.log

# Logs dos containers
docker logs -f investorion-api
docker logs -f investorion-web
docker logs -f investorion-worker

# Logs do Nginx global para investorion
docker exec nginx-global tail -f /var/log/nginx/investorion_access.log
docker exec nginx-global tail -f /var/log/nginx/investorion_error.log
```

### Métricas

```bash
# Uso de disco
df -h | grep -E "/$|investorion"

# Uso de memória
free -h

# Tamanho dos volumes Docker
docker system df -v | grep investorion

# Logs do banco
docker compose -f /root/investorion/docker-compose.prod.yml logs db --tail 100
```

---

## 🔧 Troubleshooting

### Problema: 502 Bad Gateway

**Sintomas:** Acesso ao site retorna erro 502

**Diagnóstico:**
```bash
# Verificar se containers estão rodando
docker ps | grep investorion

# Verificar conectividade do nginx-global
docker exec nginx-global ping -c 1 investorion-web

# Verificar logs
docker logs nginx-global --tail 100 | grep investorion
docker logs investorion-web --tail 100
docker logs investorion-api --tail 100
```

**Soluções:**
```bash
# 1. Verificar se o container web está na rede correta
docker network inspect nginx-global_global-network | grep investorion-web

# 2. Reconectar à rede (se necessário)
docker network connect nginx-global_global-network investorion-web

# 3. Reiniciar containers
docker compose -f /root/investorion/docker-compose.prod.yml restart web api

# 4. Reiniciar nginx-global
docker restart nginx-global
```

### Problema: API retorna erro 500

**Sintomas:** Endpoints da API retornam erro interno

**Diagnóstico:**
```bash
# Verificar logs da API
docker logs investorion-api --tail 200

# Verificar conectividade com banco
docker exec investorion-api python -c "from app.database import engine; print('DB OK' if engine.connect() else 'DB FAIL')"

# Verificar Redis
docker exec investorion-api python -c "import redis; r=redis.Redis(host='investorion-redis'); print(r.ping())"
```

**Soluções:**
```bash
# 1. Verificar variáveis de ambiente
docker compose -f /root/investorion/docker-compose.prod.yml config

# 2. Verificar migrações
docker compose -f /root/investorion/docker-compose.prod.yml run --rm api alembic current
docker compose -f /root/investorion/docker-compose.prod.yml run --rm api alembic upgrade head

# 3. Reiniciar API
docker compose -f /root/investorion/docker-compose.prod.yml restart api worker
```

### Problema: Certificado SSL não funciona

**Sintomas:** Navegador mostra aviso de certificado inválido

**Diagnóstico:**
```bash
# Verificar certificados
docker run --rm \
  -v "/root/necessito/data/certbot/conf:/etc/letsencrypt" \
  certbot/certbot certificates | grep investiorion

# Testar SSL
openssl s_client -connect investiorion.com.br:443 -servername investiorion.com.br
```

**Soluções:**
```bash
# Renovar certificado
docker stop nginx-global

docker run --rm \
  -v "/root/necessito/data/certbot/conf:/etc/letsencrypt" \
  -v "/root/necessito/data/certbot/www:/var/www/certbot" \
  -p 80:80 \
  certbot/certbot renew --force-renewal

docker start nginx-global
```

### Problema: Worker Celery não processa jobs

**Sintomas:** Jobs de cotação não são executados

**Diagnóstico:**
```bash
# Verificar status do worker
docker logs investorion-worker --tail 100

# Verificar Redis
docker exec investorion-redis redis-cli ping

# Verificar filas
docker exec investorion-api python -c "from app.worker.celery_app import app; print(app.control.inspect().active())"
```

**Soluções:**
```bash
# Reiniciar worker
docker compose -f /root/investorion/docker-compose.prod.yml restart worker

# Verificar configuração do Celery
docker compose -f /root/investorion/docker-compose.prod.yml exec api \
  celery -A app.worker.celery_app inspect stats
```

### Problema: Banco de dados não aceita conexões

**Sintomas:** Erro de conexão com PostgreSQL

**Diagnóstico:**
```bash
# Verificar status do container
docker ps | grep investorion-db

# Verificar logs
docker logs investorion-db --tail 100

# Tentar conexão manual
docker exec -it investorion-db psql -U investorion_user -d investorion_prod
```

**Soluções:**
```bash
# 1. Verificar saúde do container
docker compose -f /root/investorion/docker-compose.prod.yml ps db

# 2. Reiniciar banco (CUIDADO! Pode causar downtime)
docker compose -f /root/investorion/docker-compose.prod.yml restart db

# 3. Se o volume estiver corrompido, restaurar do backup
# CUIDADO: Isso é destrutivo!
./scripts/restore_db.sh /root/investorion/backups/investorion_backup_TIMESTAMP.sql.gz
```

---

## 📋 Checklist de Validação

### ✅ Infraestrutura
- [ ] VPS acessível via SSH
- [ ] Docker e Docker Compose funcionando
- [ ] Rede `nginx-global_global-network` existente
- [ ] Rede `investorion_app_network` criada
- [ ] Firewall permite tráfego nas portas 80 e 443

### ✅ SSL/TLS
- [ ] Certificado obtido via Let's Encrypt
- [ ] Configuração do nginx-global adicionada
- [ ] HTTPS funcionando para investiorion.com.br
- [ ] HTTPS funcionando para www.investiorion.com.br
- [ ] Redirecionamento HTTP → HTTPS funcionando
- [ ] Headers de segurança configurados

### ✅ Containers
- [ ] `investorion-db` rodando e saudável
- [ ] `investorion-redis` rodando
- [ ] `investorion-api` rodando e respondendo
- [ ] `investorion-worker` rodando e processando jobs
- [ ] `investorion-web` rodando e servindo frontend
- [ ] Todos os containers na rede correta

### ✅ Aplicação
- [ ] Migrações aplicadas com sucesso
- [ ] Superusuário criado
- [ ] Frontend acessível via HTTPS
- [ ] API respondendo em /api/
- [ ] Documentação acessível em /docs
- [ ] Login funcionando
- [ ] Dashboard carregando dados
- [ ] Jobs do Celery executando

### ✅ Backups e Monitoramento
- [ ] Script de backup funcionando
- [ ] Cron de backup configurado
- [ ] Logs sendo gerados corretamente
- [ ] Health check respondendo
- [ ] Renovação SSL automática configurada

### ✅ Segurança
- [ ] Senhas fortes em todas as variáveis
- [ ] `.env.prod` não versionado
- [ ] CORS configurado corretamente
- [ ] Headers de segurança implementados
- [ ] Acesso SSH apenas com chave (recomendado)

---

## 🎯 Comandos Rápidos

### Deploy
```bash
cd /root/investorion
set -a && source .env.prod && set +a
./scripts/deploy.sh
```

### Rollback
```bash
cd /root/investorion
./scripts/rollback.sh
```

### Backup Manual
```bash
/root/investorion/scripts/backup_db.sh
```

### Ver Logs
```bash
# Todos os containers investorion
docker compose -f /root/investorion/docker-compose.prod.yml logs -f

# Apenas API
docker logs -f investorion-api

# Apenas Worker
docker logs -f investorion-worker
```

### Restart
```bash
# Toda a aplicação
docker compose -f /root/investorion/docker-compose.prod.yml restart

# Apenas um serviço
docker compose -f /root/investorion/docker-compose.prod.yml restart api
```

### Executar Migrações
```bash
docker compose -f /root/investorion/docker-compose.prod.yml run --rm api alembic upgrade head
```

### Acessar Shell da API
```bash
docker compose -f /root/investorion/docker-compose.prod.yml exec api /bin/bash
```

### Acessar Banco de Dados
```bash
docker compose -f /root/investorion/docker-compose.prod.yml exec db psql -U investorion_user -d investorion_prod
```

---

## 🔄 CI/CD (Futuro)

Para automatizar o deploy via GitHub Actions (similar ao necessito.online):

### Workflow GitHub Actions

Criar arquivo `.github/workflows/deploy-production.yml`:

```yaml
name: Deploy Production

on:
  push:
    branches: [ main ]
  workflow_dispatch:

env:
  REGISTRY: ghcr.io
  API_IMAGE_NAME: ${{ github.repository }}/investorion-api
  WEB_IMAGE_NAME: ${{ github.repository }}/investorion-web

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      
      - name: Install dependencies
        run: |
          cd api
          pip install -e .[dev]
      
      - name: Run tests
        run: |
          cd api
          pytest

  build_push_api:
    needs: test
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    steps:
      - uses: actions/checkout@v4
      
      - name: Log in to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Build and push API image
        uses: docker/build-push-action@v5
        with:
          context: .
          file: api/Dockerfile
          push: true
          tags: |
            ${{ env.REGISTRY }}/${{ env.API_IMAGE_NAME }}:latest
            ${{ env.REGISTRY }}/${{ env.API_IMAGE_NAME }}:${{ github.sha }}

  build_push_web:
    needs: test
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    steps:
      - uses: actions/checkout@v4
      
      - name: Log in to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Build and push Web image
        uses: docker/build-push-action@v5
        with:
          context: .
          file: docker/web/Dockerfile
          build-args: |
            VITE_API_URL=/api
          push: true
          tags: |
            ${{ env.REGISTRY }}/${{ env.WEB_IMAGE_NAME }}:latest
            ${{ env.REGISTRY }}/${{ env.WEB_IMAGE_NAME }}:${{ github.sha }}

  deploy:
    needs: [build_push_api, build_push_web]
    runs-on: ubuntu-latest
    environment: production
    steps:
      - name: Deploy to VPS
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd /root/investorion
            set -a && source .env.prod && set +a
            export REGISTRY_IMAGE=${{ env.REGISTRY }}/${{ env.API_IMAGE_NAME }}
            export REGISTRY_WEB_IMAGE=${{ env.REGISTRY }}/${{ env.WEB_IMAGE_NAME }}
            export IMAGE_TAG=${{ github.sha }}
            ./scripts/deploy.sh
      
      - name: Health Check
        run: |
          sleep 15
          curl -f https://investiorion.com.br/health || exit 1
          curl -f https://investiorion.com.br/api/health || exit 1
```

### Secrets necessários no GitHub

- `VPS_HOST`: 31.97.17.10
- `VPS_USER`: root
- `VPS_SSH_KEY`: Chave SSH privada para acesso à VPS

---

## 📞 Suporte e Contatos

- **Documentação completa:** `/root/investorion/docs/`
- **Logs de deploy:** `/root/investorion/logs/deploy.log`
- **Backups:** `/root/investorion/backups/`
- **Email:** suporte@orion.invest
- **DPO:** dpo@investorion.com.br

---

## 📝 Notas Finais

1. **Isolamento completo**: Cada aplicação tem sua própria rede interna
2. **SSL centralizado**: Gerenciado pelo nginx-global
3. **Backup diário**: Executado automaticamente às 3:00 AM
4. **Logs rotativos**: Configurar logrotate para evitar estouro de disco
5. **Monitoramento**: Health checks disponíveis
6. **Zero downtime**: Deploy usa estratégia de rolling update
7. **Segurança**: Headers, HTTPS, senhas fortes

---

**Documento criado em:** 21 de Novembro de 2025  
**Próxima revisão:** Após primeiro deploy bem-sucedido  
**Versão:** 1.0
