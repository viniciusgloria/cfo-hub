import { Heart, ThumbsUp, PartyPopper, MessageCircle } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { useMuralStore } from '../store/muralStore';
import { useState } from 'react';
import { Avatar } from './Avatar';

interface Props {
  postId: number;
}

export function PostCard({ postId }: Props) {
  const post = useMuralStore((s) => s.posts.find((p) => p.id === postId));
  const toggle = useMuralStore((s) => s.toggleReaction);
  const addComment = useMuralStore((s) => s.addComment);
  const [comment, setComment] = useState('');

  if (!post) return null;

  return (
    <Card className="p-4">
      <div className="flex items-start gap-4">
  <Avatar src={post.avatar} alt={post.author} size="md" />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-800">{post.author}</p>
              <p className="text-xs text-gray-500">{post.createdAt} • {post.type}</p>
            </div>
          </div>

          <p className="mt-3 text-gray-700 whitespace-pre-wrap">{post.content}</p>

          {post.attachments && post.attachments.length > 0 && (
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
              {post.attachments.map((a) => (
                <div key={a.id} className="overflow-hidden rounded">
                  {a.type.startsWith('image/') ? (
                    <img src={a.url} alt={a.name} className="w-full h-28 object-cover rounded" />
                  ) : (
                    <a href={a.url} className="text-sm text-blue-600" target="_blank" rel="noreferrer">{a.name}</a>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 flex items-center gap-3">
            <button className="flex items-center gap-2 text-sm text-gray-600" onClick={() => toggle(post.id, 'like')}>
              <ThumbsUp size={16} /> <span>{post.reactions.like}</span>
            </button>
            <button className="flex items-center gap-2 text-sm text-gray-600" onClick={() => toggle(post.id, 'heart')}>
              <Heart size={16} /> <span>{post.reactions.heart}</span>
            </button>
            <button className="flex items-center gap-2 text-sm text-gray-600" onClick={() => toggle(post.id, 'party')}>
              <PartyPopper size={16} /> <span>{post.reactions.party}</span>
            </button>
            <div className="flex-1" />
            <div className="text-xs text-gray-500">{post.comments.length} comentários</div>
          </div>

          <div className="mt-3">
            {post.comments.map((c) => (
              <div key={c.id} className="mt-2 text-sm">
                <span className="font-medium text-gray-800">{c.author}</span>
                <span className="text-gray-500 ml-2 text-xs">{c.createdAt}</span>
                <div className="text-gray-700">{c.text}</div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center gap-2">
            <input value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Escrever um comentário..." className="flex-1 px-3 py-2 border border-gray-200 rounded-lg" />
            <Button variant="ghost" onClick={() => { if (comment.trim()) { addComment(post.id, 'Você', comment.trim()); setComment(''); } }}>
              <MessageCircle size={16} />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
