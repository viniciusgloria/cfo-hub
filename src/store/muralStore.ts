import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Attachment } from '../types';

export type PostType = 'anuncio' | 'feedback' | 'atualizacao' | 'comemoracao';

export interface Comment {
  id: number;
  author: string;
  text: string;
  createdAt: string;
}

export interface Post {
  id: number;
  author: string;
  avatar?: string;
  content: string;
  type: PostType;
  createdAt: string;
  attachments?: Attachment[];
  reactions: { like: number; heart: number; party: number };
  myReactions?: { like?: boolean; heart?: boolean; party?: boolean };
  comments: Comment[];
}

interface MuralState {
  posts: Post[];
  filter: 'Todos' | PostType;
  setFilter: (f: MuralState['filter']) => void;
  addPost: (p: Omit<Post, 'id' | 'createdAt' | 'reactions' | 'comments' | 'myReactions'>) => void;
  toggleReaction: (postId: number, reaction: 'like' | 'heart' | 'party') => void;
  addComment: (postId: number, author: string, text: string) => void;
  reset: () => void;
}

const mockPosts: Post[] = [
  {
    id: 1,
    author: 'Maria Santos',
    avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=Maria',
    content: 'Lançamos a nova versão do relatório mensal — confiram os highlights no drive.',
    type: 'anuncio',
    createdAt: '02/11/2025 09:12',
    attachments: [],
    reactions: { like: 8, heart: 3, party: 1 },
    myReactions: {},
    comments: [
      { id: 1, author: 'João Silva', text: 'Excelente! Vou revisar hoje.', createdAt: '02/11/2025 09:40' },
    ],
  },
  {
    id: 2,
    author: 'Carlos Lima',
    avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=Carlos',
    content: 'Feedback: O fluxo de aprovação poderia mostrar prazos quando houver anexos.',
    type: 'feedback',
    createdAt: '01/11/2025 17:30',
    attachments: [],
    reactions: { like: 2, heart: 1, party: 0 },
    myReactions: {},
    comments: [],
  },
];

const initialMural = {
  posts: mockPosts,
  filter: 'Todos' as MuralState['filter'],
};

export const useMuralStore = create<MuralState>()(
  persist(
    (set, get) => ({
      ...initialMural,
      setFilter: (f) => set({ filter: f }),
      addPost: (p) => {
        const posts = get().posts;
        const next: Post = {
          id: Math.max(0, ...posts.map((x) => x.id)) + 1,
          author: p.author,
          avatar: p.avatar,
          content: p.content,
          type: p.type,
          createdAt: new Date().toLocaleString(),
          attachments: p.attachments ? [...p.attachments] : [],
          reactions: { like: 0, heart: 0, party: 0 },
          myReactions: {},
          comments: [],
        };
        set({ posts: [next, ...posts] });
      },
      toggleReaction: (postId, reaction) => {
        set(({ posts }) => ({
          posts: posts.map((post) => {
            if (post.id !== postId) return post;
            const has = post.myReactions?.[reaction];
            const delta = has ? -1 : 1;
            return {
              ...post,
              reactions: { ...post.reactions, [reaction]: post.reactions[reaction] + delta },
              myReactions: { ...post.myReactions, [reaction]: !has },
            };
          }),
        }));
      },
      addComment: (postId, author, text) => {
        set(({ posts }) => ({
          posts: posts.map((post) => {
            if (post.id !== postId) return post;
            const nextId = Math.max(0, ...post.comments.map((c) => c.id)) + 1;
            return { ...post, comments: [...post.comments, { id: nextId, author, text, createdAt: new Date().toLocaleString() }] };
          }),
        }));
      },
      reset: () => set(initialMural),
    }),
    {
      name: 'cfo:mural', // localStorage key
      partialize: (state) => ({ posts: state.posts }),
    }
  )
);

