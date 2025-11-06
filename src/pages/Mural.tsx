import { useState } from 'react';
import { Plus, ImageIcon, Filter } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
// Input removed (not used)
import { useMuralStore } from '../store/muralStore';
import { PostCard } from '../components/PostCard';
import toast from 'react-hot-toast';
import { SkeletonCard } from '../components/ui/SkeletonCard';
import { useEffect } from 'react';

export function Mural() {
  const posts = useMuralStore((s) => s.posts);
  const filter = useMuralStore((s) => s.filter);
  const setFilter = useMuralStore((s) => s.setFilter);
  const addPost = useMuralStore((s) => s.addPost);

  const [open, setOpen] = useState(false);
  const [type, setType] = useState<'anuncio'|'feedback'|'atualizacao'>('anuncio');
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState<Array<{ id: number; name: string; url: string; type: string }>>([])

  const filtered = filter === 'Todos' ? posts : posts.filter(p => p.type === filter);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // simulate initial load to demonstrate skeletons
    const t = setTimeout(() => setIsLoading(false), 450);
    return () => clearTimeout(t);
  }, []);

  function handlePublish() {
    if (!content.trim() && attachments.length === 0) return toast.error('Escreva algo ou adicione um anexo antes de publicar');
    // prepare attachments: ensure numeric ids (store expects numbers in typings)
    const prepared = attachments.map((a) => ({ id: a.id, name: a.name, url: a.url, type: a.type }));
    addPost({ author: 'Você', content: content.trim(), type, avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=Voce', attachments: prepared });
    // revoke object URLs
    attachments.forEach((a) => URL.revokeObjectURL(a.url));
    setContent('');
    setAttachments([]);
    setOpen(false);
    toast.success('Publicação criada');
  }

  return (
    <div className="space-y-6">
      <Card className="p-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Mural</h3>
          <p className="text-sm text-gray-500">Veja as últimas publicações e novidades da equipe</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-md">
            <Filter size={16} />
            <select value={filter} onChange={(e) => setFilter(e.target.value as any)} className="bg-transparent text-sm outline-none">
              <option value="Todos">Todos</option>
              <option value="anuncio">Anúncios</option>
              <option value="feedback">Feedbacks</option>
              <option value="atualizacao">Atualizações</option>
            </select>
          </div>
          <Button onClick={() => setOpen(true)}>
            <Plus size={16} />
            <span className="ml-2">Nova publicação</span>
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
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Conteúdo</label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={6} className="w-full px-3 py-2 border border-gray-200 rounded-lg" />
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
                  const files = Array.from(e.target.files || []);
                  const newAttachments = files.map((f, idx) => ({ id: Date.now() + idx, name: f.name, url: URL.createObjectURL(f), type: f.type }));
                  setAttachments((prev) => [...prev, ...newAttachments]);
                  // reset input value so same file can be selected again
                  ;(e.target as HTMLInputElement).value = '';
                }}
              />

              {attachments.length > 0 && (
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {attachments.map((a) => (
                    <div key={a.id} className="relative rounded overflow-hidden">
                      {a.type.startsWith('image/') ? (
                        <img src={a.url} alt={a.name} className="w-full h-24 object-cover rounded" />
                      ) : (
                        <a href={a.url} target="_blank" rel="noreferrer" className="text-sm text-blue-600">{a.name}</a>
                      )}
                      <button
                        onClick={() => {
                          URL.revokeObjectURL(a.url);
                          setAttachments((prev) => prev.filter((x) => x.id !== a.id));
                        }}
                        className="absolute top-1 right-1 bg-white bg-opacity-80 rounded-full p-1 text-red-600"
                        aria-label={`Remover ${a.name}`}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button onClick={handlePublish}>Publicar</Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
