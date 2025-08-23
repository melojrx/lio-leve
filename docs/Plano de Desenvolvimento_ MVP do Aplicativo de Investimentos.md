### **Plano de Desenvolvimento: MVP do Aplicativo de Investimentos**

Este documento serve como um guia estratégico e técnico para a criação de um MVP (Produto Mínimo Viável) e o planejamento futuro de um aplicativo para consolidação e acompanhamento de carteiras de investimentos.

### **1\. Análise de Funcionalidades (Roadmap Completo)**

| Funcionalidade | Descrição | Prioridade |
| :---- | :---- | :---- |
| **Cadastro & Onboarding** | Sistema seguro de login/registro e um tutorial inicial simples para guiar o primeiro uso. | **Essencial (MVP)** |
| **Cadastro Manual de Ativos** | Permitir que o usuário adicione seus investimentos com validação de ticker em tempo real. | **Essencial (MVP)** |
| **Dashboard Consolidado** | Visão geral do patrimônio, rentabilidade e variação diária, com indicadores visuais e filtros de período (1D, 1M, 1A). | **Essencial (MVP)** |
| **Visão Detalhada da Carteira** | Listar todos os ativos, mostrando quantidade, preço médio, preço atual e o resultado (lucro/prejuízo). | **Essencial (MVP)** |
| **Histórico de Transações** | Uma tela para o usuário visualizar todas as operações de compra e venda já realizadas. | **Essencial (MVP)** |
| **Gráficos de Composição** | Gráficos (pizza/barras) mostrando a alocação por tipo de ativo e por setor. | **Essencial (MVP)** |
| **Cotações em Tempo Real** | Buscar preços atualizados dos ativos de renda variável. | **Essencial (MVP)** |
| **Fale Conosco (E-mail)** | Um link simples que abre o cliente de e-mail do usuário para contato com o suporte. | **Essencial (MVP)** |
| **Análise de Proventos** | Funcionalidade completa para registro e análise de dividendos, JCP, etc. Inclui visão de calendário, histórico mensal por ano e lista detalhada de pagamentos por ativo. | **Pós-MVP** |
| **Integração com CEI/B3** | Conectar-se ao Canal Eletrônico do Investidor para importar notas de corretagem e posições de forma automática. | **Pós-MVP** |
| **Versão Web** | Desenvolvimento de uma interface web completa que consome a mesma API, oferecendo uma experiência otimizada para desktops. | **Pós-MVP** |
| **Comparadores e Notícias** | Ferramentas de análise avançada e um feed de notícias relevantes do mercado financeiro. | **Pós-MVP** |

### **2\. Arquitetura Proposta**

* **Frontend (Mobile App):**  
  * **Framework:** React Native com Expo.  
  * **Gerenciamento de Estado:** Zustand ou Context API.  
  * **UI Kit:** React Native Paper ou NativeBase.  
* **Backend (API):**  
  * **Framework:** Django com Django Rest Framework (DRF).  
  * **Autenticação:** JWT (JSON Web Tokens).  
  * **Cache:** **Redis** para cacheamento inteligente de cotações e outros dados de acesso frequente.  
* **Banco de Dados:**  
  * **SGBD:** PostgreSQL.  
* **Fonte de Dados Externos (Cotações):**  
  * **Primária:** [Brapi](https://brapi.dev/) ou [Alpha Vantage](https://www.alphavantage.co/) (oferecem planos gratuitos com limites).  
  * **Secundária/Fallback:** [Yahoo Finance API](https://pypi.org/project/yfinance/).  
* **Infraestrutura (Deployment):**  
  * **Servidor:** VPS (Virtual Private Server) com Ubuntu.  
  * **Containerização:** Docker e Docker Compose.  
  * **Stack de Produção:** NGINX \+ Gunicorn \+ PostgreSQL \+ Redis.

### **3\. Plano de Desenvolvimento Detalhado (Roadmap do MVP)**

**Estimativa Total do MVP: \~6 Semanas**

#### **Fase 0: Configuração e Base do Projeto (0.5 semana)**

* \[ \] **Git:** Criar repositório no GitHub/GitLab.  
* \[ \] **Backend:** Iniciar projeto Django, instalar dependências, configurar settings.py.  
* \[ \] **Frontend:** Iniciar projeto com npx create-expo-app, instalar bibliotecas de navegação, UI Kit e axios.  
* \[ \] **Infraestrutura:** Criar docker-compose.yml para o ambiente de desenvolvimento (Django, Postgres, Redis).

#### **Fase 1: Backend \- O Coração da Aplicação (2.5 semanas)**

* \[ \] **Models.py:** Definir os modelos no Django:  
  * **Custom User Model:** Herdando de AbstractUser, com email como USERNAME\_FIELD.  
  * **Portfolio:** user (1-1), total\_invested, current\_value.  
  * **Asset:** user (FK), ticker, type (com choices), sector, is\_active (para soft delete).  
  * **Transaction:** asset (FK), type, quantity, unit\_price, transaction\_date.  
* \[ \] **Serializers & Views (DRF):**  
  * Endpoints de autenticação (/register, /token).  
  * Endpoints para CRUD de Transações, com lógica para atualizar o Portfolio.  
  * Endpoint de Dashboard, otimizado com select\_related e prefetch\_related.  
  * Endpoint de validação de tickers (/api/assets/validate-ticker/).  
* \[ \] **Serviços e Performance:**  
  * Implementar serviço de busca de cotações com cache em **Redis**.  
  * Configurar **Paginação** nas listagens (ativos, transações).  
  * Implementar **Rate Limiting** (throttling) na API.

#### **Fase 2: Frontend \- A Interface com o Usuário (2 semanas)**

* \[ \] **Fluxo Inicial:**  
  * Telas de Autenticação (Login, Cadastro).  
  * Implementar um fluxo de **Onboarding** simples na primeira vez que o usuário abre o app.  
* \[ \] **Telas Principais:**  
  * **Dashboard:** Com cards, indicadores visuais (cores, setas) e filtros de período.  
  * **Carteira/Ativos:** Listagem dos ativos.  
  * **Histórico de Transações:** Tela dedicada para listar todas as operações.  
* \[ \] **Adicionar Transação (UX Melhorada):**  
  * Formulário com **autocomplete** para tickers.  
  * Validação do ticker em tempo real.  
  * Mostrar ao usuário o impacto da nova compra no seu preço médio.  
* \[ \] **Configurações/Perfil:**  
  * Adicionar link "Fale Conosco" que abre o cliente de e-mail.

#### **Fase 3: Testes, Deploy e Polimento (1.5 semanas)**

* \[ \] **Testes:**  
  * Testes de integração com as APIs externas (cotações).  
  * Testes E2E dos fluxos principais (cadastro \-\> add transação \-\> ver dashboard).  
* \[ \] **Deploy:**  
  * Configurar NGINX, Gunicorn e certificados SSL (Let's Encrypt) na VPS.  
  * Criar docker-compose.prod.yml para o ambiente de produção.  
* \[ \] **Monitoring & Analytics:**  
  * Implementar logging estruturado.  
  * Integrar analytics básico (ex: PostHog, Google Analytics for Firebase).

### **4\. Segurança e Performance**

* **Segurança:**  
  * Forçar HTTPS em produção (SECURE\_SSL\_REDIRECT \= True).  
  * Configurar cookies seguros (SESSION\_COOKIE\_SECURE, CSRF\_COOKIE\_SECURE).  
  * Implementar Rate Limiting para proteger contra ataques de força bruta.  
* **Performance:**  
  * **Paginação** em todas as listagens da API para evitar sobrecarga.  
  * **Otimização de Queries** com select\_related e prefetch\_related para minimizar hits no banco de dados.  
  * **Cache Inteligente** com Redis para dados que não mudam com frequência (cotações, detalhes de ativos).

### **5\. Métricas e Validação do Negócio (KPIs)**

* **Engajamento:** Taxa de retenção D1, D7, D30.  
* **Ativação:** Tempo médio entre o cadastro e o registro da primeira transação.  
* **Uso:** Número de sessões por usuário/semana; Frequência de atualização do dashboard.  
* **Feedback:** Implementar um formulário simples de feedback dentro do app (pós-MVP) e acompanhar os e-mails do "Fale Conosco".

### **6\. Análise de Riscos e Mitigação**

* **Dependência de APIs Externas:**  
  * *Risco:* A API de cotações pode ficar indisponível ou mudar.  
  * *Mitigação:* Implementar um sistema de fallback para uma API secundária. Usar cache agressivo para reduzir a dependência.  
* **Dados Incorretos:**  
  * *Risco:* O usuário pode inserir dados errados, ou a API pode retornar valores incorretos.  
  * *Mitigação:* Validações robustas no frontend e backend. Permitir que o usuário edite/exclua transações facilmente.  
* **Segurança de Dados:**  
  * *Risco:* Vazamento de dados pessoais e financeiros.  
  * *Mitigação:* Seguir as melhores práticas de segurança do Django, manter dependências atualizadas, realizar backups regulares e criptografados do banco de dados.

### **7\. Próximos Passos (Evolução do Produto)**

Após o lançamento bem-sucedido do MVP e a coleta de feedback inicial, o foco se voltará para o desenvolvimento das funcionalidades **Pós-MVP** listadas na tabela principal, priorizando aquelas que gerarem mais valor e demanda por parte dos usuários, como a **Análise de Proventos** e a **Integração com a B3**.