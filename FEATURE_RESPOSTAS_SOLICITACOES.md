# Feature: Envio de Respostas com Arquivos em Solicitações

## Descrição
Gestores e admins agora podem enviar arquivos como resposta às solicitações dos colaboradores. Essa funcionalidade é ideal para enviar documentos solicitados, como holerites, atestados, e outros arquivos do banco de dados.

## Como Funciona

### Para o Gestor/Admin:

1. **Visualizar Solicitações**
   - Acesse a página "Solicitações"
   - Localize a solicitação do colaborador (ex: pedido de holerite)

2. **Enviar Resposta com Arquivo**
   - No card da solicitação, clique no botão **"Enviar Resposta"** (verde com ícone de envelope)
   - Ou abra o modal de detalhes e clique em **"Enviar Resposta com Arquivos"**

3. **Preencher Modal de Resposta**
   - Selecione um ou mais arquivos do seu computador usando o **Dropzone**
   - Adicione uma mensagem opcional explicando os arquivos (ex: "Segue holerite de outubro")
   - Clique em **"Enviar Resposta"**

4. **Confirmação**
   - A resposta será registrada com data/hora e seu nome como gestor
   - O colaborador verá os arquivos anexados na solicitação

### Para o Colaborador:

1. **Visualizar Resposta**
   - Na aba "Solicitações", o card mostrará uma seção destacada em verde
   - Indicando que o gestor enviou uma resposta

2. **Ver Detalhes**
   - Clique no card para abrir o modal de detalhes
   - Veja a mensagem do gestor e a lista de arquivos anexados
   - Os arquivos ficam visíveis para download (quando implementado backend)

## Componentes Criados/Modificados

### Novo Componente:
- **`EnviarRespostaArquivosModal.tsx`** - Modal para envio de arquivos pelo gestor
  - Usa o componente `Dropzone` para upload de múltiplos arquivos
  - Suporta upload de qualquer tipo de arquivo
  - Mostra progresso de envio

### Modificações:

#### Store: `solicitacoesStore.ts`
- **Nova interface em Solicitacao:**
  ```typescript
  respostaGestor?: {
    enviadoEm: string;
    enviadoPor: string;
    mensagem?: string;
  };
  arquivosResposta?: Attachment[];
  ```
- **Novo método:** `enviarRespostaComArquivos()`
  - Registra a resposta do gestor com arquivos

#### Página: `Solicitacoes.tsx`
- **Novos estados:**
  - `enviarRespostaOpen` - Controla exibição do modal
  - `solicitacaoResposta` - Armazena qual solicitação receberá resposta

- **Novos handlers:**
  - `handleEnviarResposta()` - Abre o modal
  - `confirmEnviarResposta()` - Confirma envio da resposta

- **Exibição no Card:**
  - Mostra badge verde com data e gestor quando há resposta
  - Lista arquivos anexados com ícone
  - Mostra mensagem do gestor

- **Exibição no Modal de Detalhes:**
  - Seção completa com resposta do gestor
  - Lista detalhada de arquivos com tamanho
  - Botão para enviar resposta (quando aplicável)

## Regras de Negócio

1. **Apenas gestores/admins podem enviar respostas**
2. **Respostas só aparecem para:**
   - Solicitações não rejeitadas
   - Que ainda não têm resposta anterior
3. **Cada solicitação pode ter apenas uma resposta** (o gestor pode editar enviando nova resposta)
4. **Mínimo de 1 arquivo** obrigatório para enviar resposta
5. **Máximo de arquivos:** Sem limite específico (dependerá do backend)

## Exemplo de Uso

### Cenário: Holerite Solicitado

1. Colaborador (Maria) vai para **Solicitações**
2. Clica em **"+ Nova Solicitação"**
3. Preenche:
   - Tipo: "Reembolso" (ou novo tipo "Documentos")
   - Título: "Holerite - Outubro/2024"
   - Descrição: "Preciso do holerite para abrir conta"
4. Envia a solicitação

5. Gestor (Ana) recebe a solicitação
6. Clica em **"Enviar Resposta"**
7. Seleciona o arquivo PDF do holerite
8. Adiciona mensagem: "Segue holerite solicitado"
9. Clica em **"Enviar Resposta"**

10. Maria volta e vê:
    - Card com badge verde "Resposta enviada"
    - Nome do gestor e data
    - Arquivo do holerite disponível

## Dados de Teste

No store já existe um exemplo com:
- Solicitação ID '2'
- Tipo: Reembolso
- Título: "Solicitação de Holerite - Outubro/2024"
- Status: Pendente com resposta já enviada (para visualizar)
- Arquivo: "Holerite_Carlos_Mendes_Outubro2024.pdf"
- Gestor: Ana Silva

## Próximos Passos (Sugestões)

1. **Backend Integration:**
   - Integrar com API para persistência de arquivos
   - Implementar download real de arquivos

2. **Notificações:**
   - Notificar colaborador quando resposta for enviada
   - E-mail com download direto do arquivo

3. **Edição de Resposta:**
   - Permitir que gestor edite/substitua resposta anterior

4. **Aprovação Automática:**
   - Marcar como "Respondida" em vez de "Aprovada"
   - Adicionar novo status "respondida"

5. **Histórico:**
   - Manter histórico de todas as respostas enviadas
   - Registrar quem enviou e quando
