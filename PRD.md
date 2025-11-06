# CFO Hub - Product Requirements Document v1.0

## EXECUTIVE SUMMARY
Sistema de gestão interna all-in-one para PMEs (10-50 pessoas) sem RH dedicado. Substitui 5+ ferramentas (ponto, solicitações, comunicação, OKRs, CRM) em uma plataforma simples e acessível.

**Modelo:** SaaS B2B
**Target:** Empresas de serviços/consultoria usando OMIE
**Diferencial:** Única solução com integração financeira (OMIE) + custo 30% menor que concorrentes

---

## 1. PROBLEMA & OPORTUNIDADE

### 1.1 Problema
Empresas 10-50 pessoas precisam:
- Controlar ponto e banco de horas (obrigatório CLT)
- Gerir solicitações (materiais, férias, reembolsos)
- Comunicação interna estruturada
- Acompanhar metas e feedbacks
- Visão de custos e RH para sócios

**Dor:** Soluções existentes (Feedz, Gupy, Sólides) são:
- Caras (R$ 35-50/user)
- Complexas (exigem RH dedicado)
- Sem integração financeira

### 1.2 Oportunidade
- 1.2M PMEs no Brasil (SEBRAE 2024)
- 65% sem RH estruturado
- Mercado RH Tech: R$ 8B/ano (crescimento 25% a.a.)
- TAM: 780k empresas (10-50 pessoas)
- SAM: 156k empresas usando OMIE/ContaAzul

---

## 2. PERSONAS

### Persona 1: Sócio-Fundador (Admin)
**Nome:** Carlos, 42 anos, CEO
**Objetivo:** Visão 360° da empresa sem contratar RH
**Usa para:**
- Dashboard executivo (custos, headcount, turnover)
- Aprovar solicitações críticas
- Configurar políticas (jornada, benefícios)
- Relatórios para contabilidade
**Pain point:** "Perco 10h/mês com planilhas e emails"

### Persona 2: Gestor Operacional
**Nome:** Marina, 35 anos, Gerente Financeiro
**Objetivo:** Gerir equipe de 8 pessoas eficientemente
**Usa para:**
- Aprovar solicitações do time
- Acompanhar OKRs e dar feedbacks
- Comunicação com equipe (mural)
- Validar ponto mensal
**Pain point:** "Não sei quem está com banco de horas negativo"

### Persona 3: Colaborador CLT
**Nome:** Pedro, 28 anos, Analista
**Objetivo:** Autogestão sem depender de RH
**Usa para:**
- Registrar ponto diariamente
- Solicitar férias/materiais/reembolso
- Ver banco de horas em tempo real
- Interagir no mural
**Pain point:** "Demora 2 semanas pra aprovar uma solicitação"

---

## 3. FUNCIONALIDADES

### 3.1 MVP (V1 - Atual)
**Status:** ✅ Implementado + Deploy ready

#### Core
- [x] Login hierarquizado (Admin/Gestor/Colaborador)
- [x] Convite por email (cadastro fechado)
- [x] Dashboard personalizado por role
- [x] Persistência localStorage com reset granular

#### Ponto Eletrônico
- [x] Registro entrada/saída com timestamp
- [x] Relógio ao vivo (HH:MM:SS)
- [x] Banco de horas automático
- [x] Espelho de ponto mensal
- [x] Solicitação de ajuste
- [ ] Geolocalização opcional
- [ ] Exportar para folha (CSV)

#### Solicitações & Aprovações
- [x] Tipos: Material, Sala, Reembolso, Férias, Home Office
- [x] Fluxo aprovação (gestor → admin)
- [x] Status visual (pendente/aprovada/rejeitada)
- [x] Histórico completo
- [x] Notificações toast
- [ ] Upload comprovantes
- [ ] Aprovar em lote

#### Metas & Performance
- [x] OKRs (Objectives & Key Results)
- [x] Progresso visual circular
- [x] Filtros (Pessoal/Time/Empresa)
- [x] Atualização periódica
- [x] Feedbacks 360°
- [x] Avaliações com nota (1-10)
- [ ] Relatórios analytics

#### Comunicação
- [x] Mural social (posts + reações + comentários)
- [x] Tipos: Avisos, Comunicados, Celebrações, Eventos
- [x] Reações (👍❤️🎉)
- [x] Comentários inline
- [ ] Menções (@user)
- [ ] Anexos em posts

#### CRM Clientes (CFO Company Interno)
- [x] Lista clientes com MRR
- [x] Status contratos
- [x] Responsável por cliente
- [x] Filtros e busca
- [x] Botão "Sincronizar OMIE"
- [ ] Histórico interações
- [ ] Timeline entregas

#### Gestão de Pessoas
- [x] Lista colaboradores
- [x] Perfil com tabs (Dados/Docs/Férias/Ponto)
- [x] Busca e filtros
- [x] Organograma visual
- [ ] Admissão digital
- [ ] Upload documentos

#### Configurações
- [x] Dados empresa (logo, CNPJ, endereço)
- [x] Jornada trabalho (horas/dias/tolerância)
- [x] Gestão usuários (convites)
- [x] Integrações (placeholders)
- [x] Manutenção dados (reset granular)
- [ ] Benefícios customizáveis
- [ ] Feriados personalizados

### 3.2 V1.5 - CFO Company Exclusivo (4 semanas)
**Funcionalidade especial para uso interno**

#### Módulo BPO Financeiro
- [ ] Tela "Lançamentos Clientes"
- [ ] Listar contas a pagar/receber por cliente
- [ ] Filtros: Cliente, Status, Vencimento
- [ ] Criar lançamento manual
- [ ] Editar lançamento existente
- [ ] Excluir lançamento (com confirmação)
- [ ] Sync bidirecional OMIE
- [ ] Permissão: apenas setor BPO
- [ ] Auditoria completa (quem/quando/o quê)

**Nota:** Esta funcionalidade NÃO estará na versão comercial (go-to-market). É exclusiva para operação interna da CFO Company.

### 3.3 V2 - Go-to-Market (2-3 meses)

#### Backend Real
- [ ] Prisma + PostgreSQL (Neon)
- [ ] API REST documentada
- [ ] Auth JWT + refresh tokens
- [ ] Rate limiting
- [ ] Logs centralizados

#### Integrações
- [x] Google: SSO (OAuth 2.0)
- [ ] Google: Calendar (sync reuniões)
- [ ] Google: Drive (documentos)
- [ ] OMIE: Clientes (sync automático)
- [ ] OMIE: Contas a pagar/receber (BPO interno)
- [ ] Slack: Notificações
- [ ] WhatsApp Business: Alertas

#### Multi-tenant
- [ ] Workspaces isolados
- [ ] Domínio custom (empresa.cfohub.app)
- [ ] Branding (logo/cores por tenant)
- [ ] Dados segregados (row-level security)

#### Assinatura
- [ ] Stripe integration
- [ ] Planos Free/Starter/Growth/Enterprise
- [ ] Billing automático
- [ ] Invoice download
- [ ] Trial 7 dias (auto-cancel)

### 3.4 V3 - Scale (4-6 meses)
- [ ] Mobile app (React Native)
- [ ] API pública + webhooks
- [ ] Zapier/Make integration
- [ ] Marketplace de integrações
- [ ] Dashboard analytics avançado
- [ ] IA: Sugestões automáticas
- [ ] Integração bancária (Open Finance)
- [ ] Portal do cliente (B2B2C)

---

## 4. STACK TÉCNICO

### Frontend (Atual)

React 18.3 + TypeScript 5.6
Vite 5 (build)
Tailwind CSS 3.4
Zustand 5 (state + persist)
React Router 6
Lucide React (icons)
Recharts (gráficos)
react-hot-toast (notifications)
react-input-mask (formatação)


### Backend (V2)

Node.js 20 + Express
Prisma ORM
PostgreSQL 16 (Neon)
JWT auth
Bull (queues)
Winston (logs)


### Infra

Frontend: Vercel (edge)
Backend: Railway/Render
Database: Neon PostgreSQL
Storage: AWS S3 / Cloudflare R2
CDN: Cloudflare
Monitoring: Sentry + Logtail


---

## 5. SEGURANÇA & LGPD

### 5.1 Segurança
- HTTPS obrigatório (SSL/TLS 1.3)
- Senhas: bcrypt (salt rounds: 12)
- JWT tokens: assinados + expiração 7d
- Rate limiting: 100 req/min por IP
- Headers: HSTS, CSP, X-Frame-Options
- Logs criptografados (AES-256)
- Backup semanal (automático, 3 cópias)

### 5.2 LGPD Compliance
**Termo de Consentimento:**
- Exibido no primeiro login (pós-convite)
- Aceite obrigatório para usar sistema
- Versão assinada salva no perfil

**Dados Sensíveis:**
- CPF/RG criptografados (campo-level)
- Documentos em storage privado (URLs assinadas)
- Acesso via permissão (admin/gestor)

**Direitos do Titular:**
- Exportar dados (JSON/PDF)
- Solicitar correção (via admin)
- Direito ao esquecimento (anonimizar, não deletar)

**Logs de Auditoria:**
- Todas ações sensíveis (login, aprovação, edição)
- Formato: `user_id | action | entity | timestamp | ip`
- Retenção: 5 anos (conformidade trabalhista)
- Acesso: apenas desenvolvedores (via dashboard interno)

**DPO (Data Protection Officer):**
- Email: dpo@cfocompany.com.br
- Resposta: até 15 dias úteis

---

## 6. PRICING & GO-TO-MARKET

### 6.1 Planos
| Plano | Usuários | Preço/user | Features | Target |
|-------|----------|------------|----------|--------|
| **Free** | Até 5 | R$ 0 | Ponto + Solicitações + Mural | Tração inicial |
| **Starter** | 6-20 | R$ 29 | Free + OKRs + Feedbacks + Integrações | PMEs crescendo |
| **Growth** | 21-50 | R$ 24 | Starter + Analytics + White-label | Empresas estruturadas |
| **Enterprise** | 50+ | R$ 19 | Growth + API + SLA + Suporte dedicado | Scale-ups |

**Trial:** 7 dias (todos os recursos Growth)
**Desconto anual:** 20% (2 meses grátis)
**Setup fee:** R$ 0 (self-service)

### 6.2 Canais de Aquisição
**Primários:**
1. **SEO/Content:** Blog + Guias (ex: "Como calcular banco de horas CLT")
2. **Google Ads:** Keywords long-tail (baixo CPC)
3. **LinkedIn Ads:** Targeting sócios/gestores PMEs

**Secundários:**
4. Parcerias com OMIE/ContaAzul (co-marketing)
5. Comunidades (Slack/Discord de founders)
6. Webinars mensais (educação RH)

**Não prioritário (V3):**
- Contadores (canal indireto complexo)
- Resellers/afiliados

### 6.3 Métricas Norte Star
- **Ativação:** 80% dos signups batem ponto em 48h
- **Engajamento:** 70% uso diário (DAU/MAU)
- **Retenção:** Churn <5%/mês
- **NPS:** >8 (promotores)
- **CAC payback:** <6 meses

---

## 7. ROADMAP & MILESTONES

### Fase Atual: V1 MVP ✅ (Concluído)
**Prazo:** 6 semanas (Out-Nov 2024)
**Status:** 100% implementado

**Entregas:**
- Frontend completo (8 páginas)
- UI/UX polido (empty states, loaders, validações)
- Persistência localStorage
- Responsivo mobile
- Acessibilidade básica (ARIA, keyboard nav)
- Deploy ready

**Próximo: V1.5 Interno 🏗️ (4 semanas)**
**Prazo:** Dez 2024
**Objetivo:** Uso interno CFO Company

**Milestones:**
- [ ] Módulo BPO (lançamentos clientes)
- [ ] Integração OMIE bidirecional
- [ ] Permissões granulares (setor BPO)
- [ ] Auditoria completa
- [ ] Deploy produção (cfohub.cfocompany.com.br)
- [ ] Onboarding 25 colaboradores

### V2: Go-to-Market 🚀 (10 semanas)
**Prazo:** Jan-Mar 2025
**Objetivo:** Lançamento comercial

**M1 - Backend (3 semanas):**
- Prisma + PostgreSQL
- Auth real (NextAuth + JWT)
- APIs REST (docs Swagger)

**M2 - Multi-tenant (3 semanas):**
- Workspaces isolados
- Onboarding self-service
- Billing Stripe

**M3 - Integrações (2 semanas):**
- OMIE (clientes)
- Google (SSO + Calendar + Drive)
- Slack notifications

**M4 - Launch (2 semanas):**
- Landing page
- Blog (5 posts SEO)
- Beta privado (50 empresas)
- Product Hunt launch

### V3: Scale 📈 (16 semanas)
**Prazo:** Abr-Jul 2025

- Mobile app (iOS + Android)
- API pública + webhooks
- Zapier integration
- Analytics dashboard
- IA features (sugestões, automações)

---

## 8. COMPETIDORES & DIFERENCIAÇÃO

### 8.1 Análise Competitiva

| Feature | CFO Hub | Feedz | Gupy | Sólides |
|---------|---------|-------|------|---------|
| **Ponto eletrônico** | ✅ Incluso | ❌ Add-on (+R$ 15) | ❌ Não tem | ✅ Incluso |
| **Banco de horas** | ✅ Automático | ✅ Manual | ❌ | ✅ |
| **Solicitações** | ✅ 5 tipos | ✅ 3 tipos | ❌ | ✅ 4 tipos |
| **OKRs** | ✅ Visual + KRs | ✅ Básico | ❌ | ❌ |
| **CRM clientes** | ✅ Com MRR | ❌ | ❌ | ❌ |
| **Integração financeira** | ✅ OMIE | ❌ | ❌ | ❌ |
| **Setup** | 15 min | 2-4h (consultoria) | 1-2 dias | 3-5h |
| **Preço (20 users)** | **R$ 580/mês** | R$ 740/mês | R$ 900/mês | R$ 960/mês |
| **Trial** | 7 dias | 14 dias | Demo | 7 dias |
| **Mobile app** | V3 (2025) | ✅ | ✅ | ✅ |

### 8.2 Diferenciais Únicos
1. **Integração financeira:** Único com OMIE (sincroniza clientes + MRR)
2. **Custo 30% menor:** R$ 24-29/user vs R$ 35-48 concorrentes
3. **Setup instantâneo:** 15 min vs 2-4h (sem consultoria)
4. **Foco PME:** Simplicidade > features enterprise
5. **Freemium real:** Até 5 users (concorrentes: só trial)

### 8.3 Limitações vs Competidores
**O que CFO Hub NÃO faz (propositalmente):**
- ❌ Recrutamento avançado (ATS/Vagas) → Gupy é melhor
- ❌ eLearning/Trilhas complexas → Feedz é melhor
- ❌ Folha de pagamento → Domínio/Senior é melhor
- ❌ Contratos CLT automatizados → Sólides tem
- ❌ Benefícios flexíveis (vale, plano) → Flash/Caju

**Posicionamento:**
"CFO Hub é o RH essencial. Se precisar de recrutamento pesado ou folha integrada, use ferramentas especializadas. Somos o hub central de gestão de pessoas para quem não tem RH dedicado."

---

## 9. RISCOS & MITIGAÇÕES

### 9.1 Riscos Técnicos

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Downtime Neon (DB) | Baixa | Alto | Multi-region + backup diário |
| Bug crítico pós-deploy | Média | Médio | Testes E2E + Rollback automático |
| Escalabilidade (>1k empresas) | Baixa | Alto | Sharding + Redis cache |
| LGPD violation | Baixa | Crítico | Auditoria trimestral + DPO |

### 9.2 Riscos de Negócio

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Churn alto (>8%/mês) | Média | Alto | Onboarding ativo + CS proativo |
| CAC alto (>R$ 500) | Média | Médio | Foco orgânico (SEO/Content) |
| Competidores baixam preço | Alta | Médio | Diferenciação (OMIE integration) |
| OMIE muda/corta API | Baixa | Alto | Contrato parceria + fallback manual |

### 9.3 Riscos Regulatórios
- **CLT mudanças:** Acompanhar alterações (ex: ponto eletrônico)
- **LGPD fiscalização:** Manter compliance sempre atualizado
- **Portaria 671 (REP):** Ponto eletrônico exige certificação? Verificar.

---

## 10. MÉTRICAS DE SUCESSO

### 10.1 Product Metrics (V2)
- **Time to Value:** <15min (primeiro ponto batido)
- **Activation Rate:** >75% (3+ ações em 7 dias)
- **DAU/MAU:** >0.7 (uso diário)
- **Feature Adoption:**
  - Ponto: 95%+
  - Solicitações: 70%+
  - OKRs: 40%+
  - Mural: 60%+

### 10.2 Business Metrics (2025)
**Q1 (Jan-Mar):**
- 50 empresas (beta)
- R$ 25k MRR
- Churn <10%

**Q2 (Abr-Jun):**
- 200 empresas
- R$ 120k MRR
- NPS >8
- CAC <R$ 400

**Q3 (Jul-Set):**
- 500 empresas
- R$ 350k MRR
- Churn <5%
- LTV/CAC >3

---

## 11. EQUIPE & RECURSOS

### 11.1 Atual (MVP)
- 1 Full-stack (você) - 100% alocado

### 11.2 V2 (necessário)
- 1 Full-stack Senior (backend/infra)
- 1 Designer UI/UX (part-time)
- 1 QA/Tester (part-time)
- 1 Customer Success (onboarding)

### 11.3 Custos Mensais (V2)
**Equipe:** R$ 35k/mês
**Infra:** R$ 2k/mês (Vercel + Neon + Sentry)
**Marketing:** R$ 5k/mês (ads + ferramentas)
**SaaS tools:** R$ 1k/mês
**Total burn:** ~R$ 45k/mês

**Break-even:** 180 users pagantes (Starter @ R$ 29)

---

## 12. CONSIDERAÇÕES FINAIS

### 12.1 Visão 3 Anos
"CFO Hub será o sistema de RH #1 para PMEs brasileiras que usam OMIE, com 5k empresas ativas e R$ 3M MRR."

### 12.2 Decisões Estratégicas
- **Foco PME:** Não competir com enterprise (SAP/Oracle)
- **Partner-first:** Integrar com melhor da classe (OMIE, Stripe, Google)
- **Mobile-second:** Web primeiro, app depois (V3)
- **Bootstrap-friendly:** Crescimento orgânico, capital opcional

### 12.3 Next Actions (Prioritizado)
1. ✅ Finalizar V1 (concluído)
2. 🏗️ Deploy Vercel + domínio (1 dia)
3. 🏗️ Desenvolver módulo BPO interno (4 semanas)
4. 📋 Planejar V2 detalhado (2 semanas)
5. 💰 Validar pricing (entrevistar 20 prospects)

---

**Versão:** 1.0
**Última atualização:** 05/11/2025
**Próxima revisão:** Dez/2024 (pós V1.5)
**Owner:** João Silva (Founder/Dev)
**Aprovação:** Pendente (sócios CFO Company)
