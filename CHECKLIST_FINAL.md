# ✅ CHECKLIST FINAL - SISTEMA PRONTO PARA REACT NATIVE

## 🔐 **1. CONFIGURAÇÃO DE SEGURANÇA**

### Variáveis de Ambiente:
- [ ] ✅ Criar arquivo `.env.local` na raiz do projeto
- [ ] ✅ Definir `NEXTAUTH_SECRET` (mínimo 32 caracteres)
- [ ] ✅ Configurar `DATABASE_URL` do PostgreSQL
- [ ] ✅ Definir `NEXTAUTH_URL` (localhost:3000 ou seu domínio)
- [ ] ✅ Verificar se `.env*` está no `.gitignore` (já está)

### Gerar NEXTAUTH_SECRET:
```bash
# Execute no terminal:
openssl rand -base64 32
```

---

## 🗄️ **2. BANCO DE DADOS**

### Setup do Prisma:
- [ ] ✅ Instalar dependências: `npm install`
- [ ] ✅ Gerar cliente Prisma: `npx prisma generate`
- [ ] ✅ Executar migrações: `npx prisma db push`
- [ ] ✅ (Opcional) Seed inicial: `npm run seed`

### Verificar Tabelas Necessárias:
- [ ] ✅ `User` (pacientes e médicos)
- [ ] ✅ `Protocol` (protocolos médicos)
- [ ] ✅ `UserProtocol` (assignments)
- [ ] ✅ `ProtocolDay` (dias do protocolo)
- [ ] ✅ `ProtocolSession` (sessões)
- [ ] ✅ `ProtocolTask` (tarefas)

---

## 🚀 **3. ENDPOINTS CRIADOS/ATUALIZADOS**

### ✅ Autenticação Mobile:
- [x] `POST /api/auth/mobile/login` - **PRONTO**
- [x] `POST /api/auth/mobile/validate` - **CRIADO**

### ✅ Perfil do Paciente:
- [x] `GET /api/patient/profile` - **ATUALIZADO** (suporte mobile)

### ✅ Protocolos:
- [x] `GET /api/protocols/assignments` - **CRIADO**

### ✅ Progresso dos Protocolos:
- [x] `POST /api/protocols/progress` - **ATUALIZADO** (suporte mobile)
- [x] `GET /api/protocols/progress` - **ATUALIZADO** (suporte mobile)

### ✅ Daily Check-in Mobile:
- [x] `GET /api/mobile/daily-checkin` - **CRIADO** (buscar perguntas e status)
- [x] `POST /api/mobile/daily-checkin` - **CRIADO** (submeter respostas)

### ✅ Sistema de Indicações:
- [x] `GET /api/referrals/patient` - **ATUALIZADO** (suporte mobile)
- [x] `POST /api/referrals/create` - **CRIADO**
- [x] `POST /api/referrals/patient` - **ATUALIZADO** (resgatar recompensas)

### ✅ Sistema de Cursos:
- [x] `GET /api/courses/available` - **ATUALIZADO** (suporte mobile)
- [x] `GET /api/courses/{id}` - **ATUALIZADO** (suporte mobile)
- [x] `POST /api/courses/lessons/complete` - **CRIADO**

### ✅ Sistema de Registro e Ativação:
- [x] `POST /api/auth/mobile/register` - **CRIADO** (registro sem clínica)
- [x] `POST /api/doctor/activate-patient` - **CRIADO** (ativação por email)

---

## 🧪 **4. TESTES DOS ENDPOINTS**

### Testar Login Mobile:
```bash
curl -X POST http://localhost:3000/api/auth/mobile/login \
  -H "Content-Type: application/json" \
  -d '{"email":"paciente@teste.com","password":"senha123"}'
```

### Testar Validação de Token:
```bash
curl -X POST http://localhost:3000/api/auth/mobile/validate \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### Testar Perfil:
```bash
curl -X GET http://localhost:3000/api/patient/profile \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### Testar Protocolos:
```bash
curl -X GET http://localhost:3000/api/protocols/assignments \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### Testar Daily Check-in Mobile - Buscar Perguntas:
```bash
curl -X GET "http://localhost:3000/api/mobile/daily-checkin?protocolId=PROTOCOL_ID_AQUI" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### Testar Daily Check-in Mobile - Submeter Respostas:
```bash
curl -X POST http://localhost:3000/api/mobile/daily-checkin \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "protocolId": "PROTOCOL_ID_AQUI",
    "responses": [
      {
        "questionId": "QUESTION_ID_1",
        "answer": "Muito bem"
      },
      {
        "questionId": "QUESTION_ID_2", 
        "answer": "8"
      }
    ]
  }'
```

### Testar Progresso - Marcar Tarefa:
```bash
curl -X POST http://localhost:3000/api/protocols/progress \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{"protocolTaskId":"TASK_ID_AQUI","date":"2024-01-15","notes":"Tarefa concluída"}'
```

### Testar Progresso - Buscar:
```bash
curl -X GET "http://localhost:3000/api/protocols/progress?protocolId=PROTOCOL_ID_AQUI" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### Testar Dashboard de Indicações:
```bash
curl -X GET http://localhost:3000/api/referrals/patient \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### Testar Criar Indicação:
```bash
curl -X POST http://localhost:3000/api/referrals/create \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{"name":"João Silva","email":"joao@email.com","phone":"+5511999999999","notes":"Amigo interessado"}'
```

### Testar Resgatar Recompensa:
```bash
curl -X POST http://localhost:3000/api/referrals/patient \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{"rewardId":"REWARD_ID_AQUI"}'
```

### Testar Cursos:
```bash
# Buscar cursos disponíveis
curl -X GET "http://localhost:3000/api/courses/available" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"

# Buscar curso específico
curl -X GET "http://localhost:3000/api/courses/COURSE_ID" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"

# Marcar lição como concluída
curl -X POST "http://localhost:3000/api/courses/lessons/complete" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{"lessonId": "LESSON_ID"}'
```

### Testar Registro e Ativação:
```bash
# Registro de novo paciente (sem clínica)
curl -X POST "http://localhost:3000/api/auth/mobile/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@email.com", 
    "password": "senha123",
    "phone": "+5511999999999"
  }'

# Médico ativar paciente (NextAuth token)
curl -X POST "http://localhost:3000/api/doctor/activate-patient" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer DOCTOR_TOKEN" \
  -d '{"patientEmail": "joao@email.com"}'
```

---

## 📱 **5. CONFIGURAÇÃO REACT NATIVE**

### Dependências Necessárias:
```bash
npm install axios @react-native-async-storage/async-storage
```

### Configurar API Base URL:
```javascript
// No seu arquivo de configuração da API
const API_BASE_URL = 'http://localhost:3000'; // Desenvolvimento
// const API_BASE_URL = 'https://sua-api.com'; // Produção
```

---

## 🔧 **6. COMANDOS PARA RODAR O SISTEMA**

### Desenvolvimento:
```bash
# 1. Instalar dependências
npm install

# 2. Configurar banco de dados
npx prisma generate
npx prisma db push

# 3. (Opcional) Seed de dados
npm run seed

# 4. Rodar servidor
npm run dev
```

### Produção:
```bash
# 1. Build
npm run build

# 2. Start
npm start
```

---

## 🚨 **7. PROBLEMAS COMUNS E SOLUÇÕES**

### "JWT_SECRET is undefined":
```bash
# Solução:
echo 'NEXTAUTH_SECRET="sua-chave-aqui"' >> .env.local
```

### "Database connection failed":
```bash
# Verificar se PostgreSQL está rodando
# Verificar se DATABASE_URL está correto
```

### "Token inválido no React Native":
```javascript
// Verificar se o token está sendo enviado corretamente:
console.log('Token:', await AsyncStorage.getItem('userToken'));
```

### CORS Error no React Native:
```javascript
// Adicionar no next.config.js:
module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type,Authorization' },
        ],
      },
    ];
  },
};
```

---

## ✅ **8. CHECKLIST DE DEPLOY**

### Antes de subir no Git:
- [ ] ✅ Arquivo `.env.local` NÃO está commitado
- [ ] ✅ Todas as senhas/chaves estão em variáveis de ambiente
- [ ] ✅ Documentação está atualizada
- [ ] ✅ Endpoints testados e funcionando

### Para Produção (Vercel/Railway/etc):
- [ ] ✅ Configurar `DATABASE_URL` na plataforma
- [ ] ✅ Configurar `NEXTAUTH_SECRET` na plataforma
- [ ] ✅ Configurar `NEXTAUTH_URL` com domínio real
- [ ] ✅ Testar todos os endpoints em produção

---

## 🎯 **9. FUNCIONALIDADES DISPONÍVEIS**

### ✅ Para o App React Native:
- [x] **Login de paciente** com email/senha
- [x] **Validação de token JWT** (30 dias de validade)
- [x] **Perfil completo** do paciente + dados do médico
- [x] **Lista de protocolos** atribuídos com dias/sessões/tarefas
- [x] **Status dos protocolos** (ACTIVE, INACTIVE, UNAVAILABLE)
- [x] **Sistema de progresso** - marcar tarefas como concluídas
- [x] **Histórico de progresso** - visualizar progresso por data/protocolo
- [x] **Daily Check-in** - responder perguntas diárias do protocolo
- [x] **Status do Check-in** - verificar se já fez check-in hoje
- [x] **Editar Check-in** - atualizar respostas do dia
- [x] **Sistema de indicações** - criar indicações e ganhar créditos
- [x] **Recompensas** - resgatar recompensas com créditos ganhos
- [x] **Dashboard de indicações** - estatísticas e histórico completo
- [x] **Autenticação segura** com JWT
- [x] **Sistema de cursos** - visualizar cursos atribuídos e disponíveis
- [x] **Progresso de cursos** - marcar lições como concluídas
- [x] **Módulos e lições** - estrutura organizada de conteúdo educacional
- [x] **Registro independente** - pacientes podem se registrar sem médico
- [x] **Ativação por médico** - médicos ativam pacientes usando email
- [x] **Privacidade do paciente** - paciente escolhe seu médico

### 🔄 Funcionalidades Extras (já existem):
- [ ] Chat com IA
- [ ] Transcrição de áudio
- [ ] Relatórios de sintomas
- [ ] Estatísticas do paciente

---

## 🚀 **SISTEMA ESTÁ PRONTO!**

Com este checklist completo, seu sistema está **100% funcional** para:

1. ✅ **Autenticação mobile** segura
2. ✅ **Perfil do paciente** completo
3. ✅ **Protocolos médicos** detalhados
4. ✅ **Daily Check-in mobile** completo
5. ✅ **Segurança** com JWT e variáveis de ambiente
6. ✅ **Pronto para Git** sem informações sensíveis

**Próximo passo**: Implementar o app React Native usando os endpoints documentados! 