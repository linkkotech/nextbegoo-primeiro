# Begoo - Console de Gestão do Comerciante

Infraestrutura Digital Multi-tenant para Comércio Local

## Stack Tecnológico

- **Next.js 16** - App Router, Server Actions e API Routes (API First)
- **Prisma ORM** - Conectado ao Supabase (Postgres)
- **Tailwind CSS 4** - Estilização
- **NextAuth** - Autenticação com CredentialsProvider
- **Stripe** - Gateway de pagamentos
- **OpenAI** - Orquestração de Assistentes Virtuais

## Estrutura do Projeto

```
/app
  /api                    # API Routes (API First)
    /check-eligibility    # Governança e elegibilidade
    /process-checkout     # Mini Checkout e Escrow
    /convert-moneta       # Conversão Moneta
  /actions                # Server Actions
    eligibility.ts        # Lógica de elegibilidade
  /console
    /[merchantId]         # Workspace do comerciante
/lib
  /auth                   # NextAuth setup
  /db                     # Prisma Client
/prisma
  schema.prisma           # Modelo de dados multi-tenant
```

## Configuração Inicial

1. **Instalar dependências:**
   ```bash
   npm install
   ```

2. **Configurar variáveis de ambiente:**
   ```bash
   cp .env.example .env
   # Editar .env com suas credenciais
   ```

3. **Configurar banco de dados:**
   ```bash
   # Gerar Prisma Client
   npm run db:generate

   # Aplicar migrações
   npm run db:migrate
   ```

4. **Executar em desenvolvimento:**
   ```bash
   npm run dev
   ```

## Funcionalidades Principais

### 1. Governança e Elegibilidade
- Endpoint: `/api/check-eligibility`
- Server Action: `checkEligibility()`
- Verifica: Assinatura ativa, conformidade cadastral, horário de funcionamento, status do assistente virtual

### 2. Multi-tenant (Workspaces)
- Cada Merchant opera em seu próprio workspace
- Isolamento de dados via `merchant_id` em todas as tabelas críticas
- NextAuth injeta `merchantId` nas requisições

### 3. RAG Segmentado
- Conhecimento segmentado por `merchant_id`
- Assistente Virtual utiliza apenas catálogo e FAQs do próprio comerciante

## Próximos Passos

- [ ] Implementar lógica completa de checkout com Stripe
- [ ] Implementar sistema de Escrow
- [ ] Implementar conversão Moneta completa
- [ ] Configurar integração com Supabase Auth
- [ ] Adicionar testes unitários
- [ ] Implementar logs de uso de IA (AI_Usage_Logs)
