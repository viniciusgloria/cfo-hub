import { useEffect, useState, useRef, ChangeEvent, useMemo } from 'react';
import { Plus, ImageIcon, Filter } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
// Input removed (not used)
import { useMuralStore } from '../store/muralStore';
import { PostCard } from '../components/PostCard';
import toast from 'react-hot-toast';
import { SkeletonCard } from '../components/ui/SkeletonCard';
import { useAttachmentUploader } from '../hooks/useAttachmentUploader';
import { useColaboradoresStore } from '../store/colaboradoresStore';
import { useNotificacoesStore } from '../store/notificacoesStore';

export function Mural() {
  const posts = useMuralStore((s) => s.posts);
  const filter = useMuralStore((s) => s.filter);
  const setFilter = useMuralStore((s) => s.setFilter);
  const addPost = useMuralStore((s) => s.addPost);

  const allColaboradores = useColaboradoresStore((s) => s.colaboradores);
  const colaboradores = useMemo(() => allColaboradores.filter(c => c.status === 'ativo'), [allColaboradores]);
  const addNotificacao = useNotificacoesStore((s) => s.adicionarNotificacao);

  const [open, setOpen] = useState(false);
  const [type, setType] = useState<'anuncio'|'feedback'|'atualizacao'|'comemoracao'>('anuncio');
  const [content, setContent] = useState('');
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionListOpen, setMentionListOpen] = useState(false);
  const [mentionStart, setMentionStart] = useState<number | null>(null);
  const emojis = ['🎉', '👏', '🥳', '🏆', '🎂', '💡', '🚀', '❤️', '😃', '🌟'];
  const {
    attachments,
    readyAttachments,
    handleFiles,
    removeAttachment,
    reset: resetAttachments,
    isUploading,
    hasError,
  } = useAttachmentUploader();

  const filtered = filter === 'Todos' ? posts : posts.filter(p => p.type === filter);
  const [isLoading, setIsLoading] = useState(true);

  // Early-return guard: if posts is undefined/null due to store migration/corruption, render fallback
  if (!Array.isArray(posts)) {
    return (
      <div className="p-6 text-center text-gray-500">
        <p>Erro ao carregar o mural. Tente recarregar a página.</p>
      </div>
    );
  }

  useEffect(() => {
    // simulate initial load to demonstrate skeletons
    const t = setTimeout(() => setIsLoading(false), 450);
    return () => clearTimeout(t);
  }, []);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Usa ChangeEvent importado para evitar referência runtime a React undefined
  function handleContentChange(e: ChangeEvent<HTMLTextAreaElement>) {
    const value = e.target.value;
    setContent(value);
    const cursor = e.target.selectionStart;
    const before = value.slice(0, cursor);
    const match = /@([\w\u00C0-\u017F]*)$/.exec(before);
    if (match) {
      setMentionQuery(match[1]);
      setMentionListOpen(true);
      setMentionStart(cursor - match[0].length);
    } else {
      setMentionListOpen(false);
      setMentionQuery('');
      setMentionStart(null);
    }
  }

  function handleMentionSelect(colab: { nome: string }) {
    if (mentionStart !== null && textareaRef.current) {
      const before = content.slice(0, mentionStart);
      const after = content.slice(textareaRef.current.selectionStart);
      const mentionText = `@${colab.nome} `;
      setContent(before + mentionText + after);
      setMentionListOpen(false);
      setMentionQuery('');
      setMentionStart(null);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      }, 0);
    }
  }

  function getMentions(text: string) {
    const regex = /@([\w\u00C0-\u017F]+)/g;
    const found: string[] = [];
    let m;
    while ((m = regex.exec(text))) {
      found.push(m[1]);
    }
    return found;
  }

  function handlePublish() {
    if (isUploading) {
      toast.error('Aguarde o envio dos anexos terminar antes de publicar.');
      return;
    }
    if (hasError) {
      toast.error('Remova ou tente enviar novamente os anexos com erro.');
      return;
    }
    if (!content.trim() && readyAttachments.length === 0) {
      toast.error('Escreva algo ou adicione um anexo antes de publicar.');
      return;
    }

    addPost({
      author: 'Voce',
      content: content.trim(),
      type,
      avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=Voce',
      attachments: readyAttachments,
    });
    // Notificações para mencionados
    const mencionados = getMentions(content);
    colaboradores.forEach((c) => {
      if (mencionados.includes(c.nome)) {
        addNotificacao({
          tipo: 'nova_mensagem_mural',
          titulo: 'Você foi mencionado no Mural',
          mensagem: `Você foi mencionado por Voce em uma publicação: "${content.trim()}"`,
          link: '/mural',
          icone: 'AtSign',
          cor: 'text-blue-600',
        });
      }
    });
    setContent('');
    resetAttachments();
    setOpen(false);
    toast.success('Publicacao criada');
  }

  return (
    <div className="space-y-6">
      <Card className="p-4 flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold">Mural</h3>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-md">
            <Filter size={16} />
            <select value={filter} onChange={(e) => setFilter(e.target.value as any)} className="bg-transparent text-sm outline-none">
              <option value="Todos">Todos</option>
              <option value="anuncio">Anúncios</option>
              <option value="feedback">Feedbacks</option>
              <option value="atualizacao">Atualizações</option>
              <option value="comemoracao">Comemorações</option>
            </select>
          </div>
          <Button onClick={() => setOpen(true)} className="flex items-center gap-2 whitespace-nowrap">
            <Plus size={16} />
            Novo Post
          </Button>
        </div>
      </Card>

      <div className="space-y-4">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : (
          filtered.map((p) => (
            <PostCard key={p.id} postId={p.id} />
          ))
        )}
      </div>

      <Modal isOpen={open} onClose={() => setOpen(false)} title="Nova publicação">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Tipo</label>
            <select value={type} onChange={(e) => setType(e.target.value as any)} className="w-full px-3 py-2 border border-gray-200 rounded-lg">
              <option value="anuncio">Anúncio</option>
              <option value="feedback">Feedback</option>
              <option value="atualizacao">Atualização</option>
              <option value="comemoracao">Comemoração</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Conteúdo</label>
            <div className="mb-2 flex flex-wrap gap-2 items-center relative">
              <button
                type="button"
                className="px-2 py-1 text-lg border border-gray-200 rounded hover:bg-gray-50"
                onClick={() => setEmojiPickerOpen((v) => !v)}
              >
                😀 Emojis
              </button>
              {emojiPickerOpen && (
                <div className="flex flex-wrap gap-1 bg-white border border-gray-200 rounded p-2 shadow absolute z-10">
                  {emojis.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      className="text-2xl p-1 hover:bg-gray-100 rounded"
                      onClick={() => {
                        setContent((c) => c + emoji);
                        setEmojiPickerOpen(false);
                      }}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
              {mentionListOpen && (
                <div className="absolute top-10 left-0 bg-white border border-gray-200 rounded shadow z-20 w-64 max-h-48 overflow-auto">
                  {colaboradores.filter(c => c.nome.toLowerCase().includes(mentionQuery.toLowerCase())).map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      className="block w-full text-left px-3 py-2 hover:bg-gray-100"
                      onClick={() => handleMentionSelect(c)}
                    >
                      <span className="font-medium">@{c.nome}</span> <span className="text-xs text-gray-500">{c.cargo}</span>
                    </button>
                  ))}
                  {colaboradores.filter(c => c.nome.toLowerCase().includes(mentionQuery.toLowerCase())).length === 0 && (
                    <div className="px-3 py-2 text-sm text-gray-400">Nenhum usuário encontrado</div>
                  )}
                </div>
              )}
            </div>
            <textarea
              ref={textareaRef}
              value={content}
              onChange={handleContentChange}
              rows={6}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <label className="flex items-center gap-2 text-gray-600">
                <ImageIcon />
                <span className="text-sm">Anexos (imagens ou arquivos)</span>
              </label>
              <input
                type="file"
                multiple
                className="mt-2"
                onChange={(e) => {
                  const files = e.target.files;
                  if (files) {
                    handleFiles(files);
                    (e.target as HTMLInputElement).value = '';
                  }
                }}
              />

              {attachments.length > 0 && (
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {attachments.map((a) => (
                    <div key={a.id} className="relative rounded border border-gray-200 bg-white p-2">
                      {a.mimeType.startsWith('image/') ? (
                        <img src={a.dataUrl} alt={a.name} className="w-full h-24 object-cover rounded" />
                      ) : (
                        <div className="text-sm text-gray-700 flex flex-col gap-1">
                          <span className="font-medium truncate" title={a.name}>{a.name}</span>
                          <a href={a.dataUrl} download={a.name} className="text-blue-600 underline text-xs">baixar</a>
                        </div>
                      )}

                      {a.status === 'done' && a.remoteUrl && (
                        <p className="mt-2 text-[10px] text-gray-400 break-words">
                          URL simulada: {a.remoteUrl}
                        </p>
                      )}

                      {a.status !== 'done' && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 text-white text-xs gap-2 rounded">
                          <span>
                            {a.status === 'uploading'
                              ? 'Enviando ' + Math.round(a.progress) + '%'
                              : 'Falha no upload'}
                          </span>
                          {a.status === 'uploading' && (
                            <div className="w-3/4 h-1 bg-white/30 rounded">
                              <div
                                className="h-full bg-white rounded"
                                style={{ width: Math.round(a.progress) + '%' }}
                              />
                            </div>
                          )}
                        </div>
                      )}

                      <button
                        onClick={() => removeAttachment(a.id)}
                        className="absolute -top-2 -right-2 bg-white border border-gray-300 rounded-full w-6 h-6 flex items-center justify-center text-xs text-red-600 shadow-sm"
                        aria-label={`Remover ${a.name}`}
                        type="button"
                      >
                        x
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {hasError && (
                <p className="mt-2 text-sm text-red-600">
                  Alguns anexos falharam no upload. Remova-os e tente novamente.
                </p>
              )}
              {isUploading && (
                <p className="mt-2 text-sm text-gray-500">Enviando anexos...</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button
                onClick={handlePublish}
                disabled={isUploading}
                title={isUploading ? 'Aguardando upload dos anexos' : undefined}
              >
                Publicar
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}




