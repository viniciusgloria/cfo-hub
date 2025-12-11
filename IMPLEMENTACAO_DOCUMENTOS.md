# Implementação: Sistema de Documentos e Onboarding

## Resumo

Implementação completa de sistema de gestão de documentos e fluxo de onboarding de colaboradores, incluindo:

1. ✅ Visualizador de PDF e imagens inline
2. ✅ Histórico completo de documentos com versionamento
3. ✅ Sistema de notificações integrado
4. ✅ Compartilhamento de pastas entre colaboradores
5. ✅ Templates de pastas por cargo
6. ✅ Status 'em_contratacao' para novos colaboradores
7. ✅ Checklists de documentos obrigatórios por cargo
8. ✅ Notificações de workflow (aprovação/rejeição/envio)
9. ✅ Dashboard de pendências RH consolidado em Solicitações
10. ✅ Re-upload de documentos com histórico
11. ✅ Bloqueio de ativação sem documentos completos
12. ✅ Email automático de boas-vindas
13. ✅ **NOVO**: Flexibilidade para ativação sem documentação em casos atípicos

## Arquitetura

### Stores

#### `documentosStore.ts`
- **Histórico de documentos**: Interface `HistoricoDocumento` com ações (criado, atualizado, aprovado, rejeitado, substituido)
- **Versionamento**: Campo `versaoAnteriorId` para rastrear versões anteriores
- **Compartilhamento**: Campo `compartilhadoCom` para pastas compartilhadas
- **Templates**: `TEMPLATES_PASTAS` com estruturas predefinidas por cargo
- **Documentos obrigatórios**: `DOCUMENTOS_OBRIGATORIOS` mapeados por cargo
- **Métodos principais**:
  - `criarPastasDeTemplate()`: Cria estrutura de pastas para novo colaborador
  - `substituirDocumento()`: Substitui documento mantendo histórico
  - `getDocumentosObrigatorios()`: Retorna lista de docs obrigatórios por cargo
  - `getProgressoDocumentos()`: Calcula percentual de conclusão
  - `compartilharPasta()`: Adiciona colaboradores ao compartilhamento

#### `colaboradoresStore.ts`
- **Status 'em_contratacao'**: Novo status para colaboradores em processo de contratação
- **Dispensa de documentação**: Campo `dispensaDocumentacao?: boolean` para casos atípicos
- **Métodos principais**:
  - `podeAtivarColaborador()`: Verifica se pode ativar (100% docs OU dispensaDocumentacao)
  - `enviarEmailBoasVindas()`: Simula envio de email com credenciais

#### `notificacoesStore.ts`
- **Novos tipos de notificação**:
  - `documento_aprovado`: Colaborador recebe quando doc é aprovado
  - `documento_rejeitado`: Colaborador recebe quando doc é rejeitado (com motivo)
  - `documento_enviado`: Gestores recebem quando colaborador envia doc
  - `documento_pendente_gestor`: Gestores recebem lembretes de pendências
- **Campo `destinatarioId`**: Notificações direcionadas a usuários específicos

### Componentes

#### `PDFViewerModal.tsx`
Modal para visualização de documentos (PDF e imagens) com controles:
- Zoom (50%, 75%, 100%, 150%, 200%)
- Rotação (90°, 180°, 270°)
- Download
- Visualização inline sem necessidade de download

#### `CompartilharPastaModal.tsx`
Interface para compartilhar pastas entre colaboradores:
- Lista de colaboradores disponíveis
- Lista de colaboradores com acesso
- Adicionar/remover acesso com um clique
- Confirmação visual de alterações

### Páginas

#### `Documentos.tsx`
Sistema completo de gestão de documentos estilo SharePoint:
- Estrutura de pastas hierárquica
- Upload com drag & drop
- Aprovação/rejeição de documentos
- Visualização inline com PDFViewerModal
- Compartilhamento de pastas
- Histórico completo de versões
- Notificações automáticas no workflow

#### `Solicitacoes.tsx` (ATUALIZADA)
Nova aba **"Documentos"** consolidando gestão de onboarding:

**Funcionalidades**:
1. **Cards de colaboradores em contratação** com:
   - Avatar, nome, cargo, email
   - Badge visual quando documentação dispensada (⚠️)
   - Barra de progresso colorida:
     - Verde: ≥100% completo
     - Azul: ≥50% completo
     - Amarelo: <50% completo

2. **Ações disponíveis**:
   - **Criar Pastas**: Gera estrutura de templates automática
   - **Enviar Email**: Simula email de boas-vindas com credenciais
   - **Dispensar documentação**: ✨ Checkbox para casos atípicos
   - **Ativar**: Botão habilitado quando 100% completo OU documentação dispensada

3. **Checklist de documentos**:
   - Lista todos documentos obrigatórios por cargo
   - Status visual: ✓ Aprovado, ⏱ Pendente, ✗ Rejeitado, ⚠ Não enviado
   - Botões rápidos de aprovar/rejeitar para cada documento
   - Seção de documentos opcionais/extras

#### `PendenciasRH.tsx` (DEPRECATED)
- Página original criada para gestão de pendências
- **REMOVIDA** do sistema para evitar duplicação
- Funcionalidade consolidada em Solicitações > Documentos

## Fluxo de Onboarding

### 1. Criação do Colaborador
```typescript
// Status inicial
const novoColaborador = {
  ...dados,
  status: 'em_contratacao',
  dispensaDocumentacao: false // Padrão: exige documentação
};
```

### 2. Criação de Pastas
Gestor acessa **Solicitações > Documentos** e clica em "Criar Pastas":
```typescript
criarPastasDeTemplate(colaboradorId, cargo, gestorId, gestorNome);
// Cria estrutura baseada em TEMPLATES_PASTAS
```

### 3. Envio de Documentos
Colaborador acessa sistema e faz upload na página **Documentos**:
```typescript
// Ao fazer upload, notifica gestores
notificarDocumentoEnviado(gestoresIds, colaboradorNome, tipoDocumento);
```

### 4. Aprovação/Rejeição
Gestor revisa documentos em **Solicitações > Documentos**:
```typescript
// Aprovar
aprovarDocumento(documentoId);
notificarDocumentoAprovado(colaboradorId, documentoNome);

// Rejeitar
rejeitarDocumento(documentoId, motivo);
notificarDocumentoRejeitado(colaboradorId, documentoNome, motivo);
```

### 5. Re-upload (se necessário)
Colaborador faz novo upload do documento rejeitado:
```typescript
// Sistema identifica e substitui automaticamente
substituirDocumento(documentoAntigoId, novoDocumento);
// Mantém histórico: versaoAnteriorId aponta para versão anterior
```

### 6. Dispensa de Documentação (NOVO - Casos Atípicos)
Para situações especiais (emergências, executivos, consultores, etc.):
```typescript
// Gestor marca checkbox "Dispensar documentação"
atualizarColaborador(id, { dispensaDocumentacao: true });

// Validação bypass
podeAtivarColaborador(id);
// Retorna: { pode: true } mesmo com 0% documentos
```

**Casos de uso**:
- Contratações emergenciais onde documentos virão depois
- Cargos executivos com processo diferenciado
- Consultores externos com requisitos distintos
- Recontratações onde documentação já existe em outro sistema
- Situações especiais definidas por políticas da empresa

### 7. Ativação
Quando 100% dos documentos aprovados OU `dispensaDocumentacao === true`:
```typescript
// Botão "Ativar" fica habilitado
atualizarColaborador(id, { status: 'ativo' });
enviarEmailBoasVindas(id); // Opcional, antes ou depois da ativação
```

## Interface de Dispensa de Documentação

### Localização
**Solicitações > Documentos** > Card do colaborador

### Elementos de UI
1. **Checkbox "Dispensar documentação"**:
   - Ao lado dos botões de ação
   - Texto: "Dispensar documentação"
   - Estilo: checkbox padrão com foco orange

2. **Badge visual** (quando ativo):
   - Exibido ao lado do nome do colaborador
   - Texto: "⚠️ Documentação dispensada"
   - Cores: orange-100 bg, orange-700 text (dark mode: orange-900 bg, orange-300 text)
   - Tamanho: xs, rounded-full

3. **Validação do botão "Ativar"**:
   ```typescript
   disabled={!podeAtivarColaborador(colaborador.id).pode}
   ```

4. **Toast de confirmação**:
   - Ao marcar: "Documentação dispensada - Situação atípica"
   - Ao desmarcar: "Documentação obrigatória reativada"

### Exemplo de Código
```tsx
<label className="flex items-center gap-2 text-sm cursor-pointer">
  <input
    type="checkbox"
    checked={colaborador.dispensaDocumentacao || false}
    onChange={(e) => {
      atualizarColaborador(colaborador.id, { 
        dispensaDocumentacao: e.target.checked 
      });
      toast.success(
        e.target.checked
          ? 'Documentação dispensada - Situação atípica'
          : 'Documentação obrigatória reativada'
      );
    }}
    className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
  />
  <span className="text-gray-700 dark:text-gray-300">
    Dispensar documentação
  </span>
</label>

{colaborador.dispensaDocumentacao && (
  <span className="px-2 py-0.5 bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 text-xs rounded-full font-medium">
    ⚠️ Documentação dispensada
  </span>
)}
```

## Documentos Obrigatórios por Cargo

### Desenvolvedores
- RG/CNH
- CPF
- Comprovante de Residência
- Diploma (Graduação ou Técnico)
- Carteira de Trabalho

### Gerentes/Gestores
- RG/CNH
- CPF
- Comprovante de Residência
- Diploma (Graduação)
- Certidões (Negativas)
- Declaração de Bens

### Administrativos
- RG/CNH
- CPF
- Comprovante de Residência
- Comprovante de Escolaridade
- Carteira de Trabalho

### Estagiários
- RG/CNH
- CPF
- Comprovante de Residência
- Comprovante de Matrícula
- Termo de Compromisso

## Templates de Pastas

### 1. Onboarding
- Contrato de Trabalho
- Termo de Confidencialidade
- Regulamento Interno
- Política de Uso de TI

### 2. Pessoais
- RG/CNH
- CPF
- Comprovante de Residência
- Foto 3x4

### 3. Contratuais
- Carteira de Trabalho
- PIS/PASEP
- Título de Eleitor
- Certidão de Casamento (se aplicável)
- Certidão de Nascimento dos Filhos (se aplicável)

### 4. Formação
- Diploma
- Histórico Escolar
- Certificados
- Cursos Complementares

## Notificações do Sistema

### Para Colaboradores
- **Documento Aprovado**: "Seu documento [nome] foi aprovado!"
- **Documento Rejeitado**: "Seu documento [nome] foi rejeitado. Motivo: [motivo]"

### Para Gestores
- **Documento Enviado**: "[Colaborador] enviou o documento [tipo] para aprovação"
- **Pendências**: "Existem [N] documentos aguardando aprovação"

## Benefícios da Consolidação

### Antes (com PendenciasRH separado)
- ❌ 2 páginas distintas para gestão de solicitações
- ❌ Navegação fragmentada
- ❌ Duplicação de conceitos
- ❌ Menu lateral poluído

### Depois (consolidado em Solicitações)
- ✅ Página única para todas solicitações
- ✅ Tabs organizadas: Gerais, Férias, Ponto, **Documentos**
- ✅ Contexto unificado para gestores
- ✅ Menor curva de aprendizado
- ✅ Interface limpa e profissional

## Tecnologias Utilizadas

- **React 18** + **TypeScript**: Type-safe component development
- **Zustand**: State management com persist
- **Tailwind CSS**: Utility-first styling com dark mode
- **Lucide React**: Ícones consistentes
- **react-hot-toast**: Notificações de feedback
- **React Router v6**: Navegação SPA

## Próximos Passos (Sugestões)

1. **Integração com serviço de email real** (atualmente simulado)
2. **Armazenamento em cloud** (AWS S3, Azure Blob, etc.)
3. **Assinatura digital** de documentos (DocuSign, Adobe Sign)
4. **OCR automático** para extração de dados de documentos
5. **Validação de documentos** com APIs governamentais (Receita, DETRAN)
6. **Lembretes automáticos** para documentos vencidos
7. **Relatórios de compliance** para auditoria

## Considerações de Segurança

- ⚠️ Documentos armazenados apenas no localStorage (desenvolvimento)
- ⚠️ Implementar criptografia para produção
- ⚠️ Controle de acesso baseado em roles (já implementado)
- ⚠️ Logs de auditoria (histórico já rastreia ações)
- ⚠️ Backup regular e disaster recovery
- ⚠️ Conformidade com LGPD para dados pessoais

## Suporte

Para dúvidas ou issues, consulte a documentação técnica ou abra um ticket no sistema de gestão de projetos.

---

## Melhorias no Cadastro de Usuários

### Campos Condicionais PJ/CLT
- **Meta de Horas Mensais**: Campo obrigatório apenas para CLT, opcional para PJ
- **CNPJ**: Obrigatório quando contrato é PJ
- **Validações específicas**: Ajustadas conforme tipo de contratação

### Navegação Adaptada
- **Ocultação de Ponto**: Usuários PJ não veem a página "Ponto" no menu lateral
- **Interface personalizada**: Experiência adequada ao tipo de colaborador

### Integração com Login
- **Regime no User**: Campo `regime` incluído na interface `User` para controle de permissões
- **Sincronização automática**: Regime atualizado automaticamente no cadastro

---

## Sistema de Permissões Granular

### Arquitetura
- **Arquivo**: `src/utils/permissions.ts`
- **Função**: `getAllowedPaths(user, cargoNome, setorNome)`
- **Lógica**: Controle baseado em role + setor + cargo

### Regras de Acesso
- **Admins**: Todas as páginas
- **Gestores**: Todas exceto configurações empresa
- **Colaboradores**:
  - Base: Dashboard, Mural, Calendário, Chat, Documentos, Feedbacks, Solicitações
  - + Ponto (se CLT)
  - + Gestão (se cargo "Gerente" ou setor TI/RH)
- **Clientes**: Dashboard, Clientes (próprios), Chat, Feedbacks
- **Visitantes**: Dashboard, Mural

### Implementação no Sidebar
- **Uso de stores**: `useAuthStore`, `useCargosSetoresStore`
- **Filtro dinâmico**: Menu lateral adaptado em tempo real
- **Performance**: Cálculo otimizado sem re-renders desnecessários

---

**Última atualização**: 2024
**Versão**: 2.0 (com flexibilidade para casos atípicos)
