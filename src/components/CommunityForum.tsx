import React, { useState } from 'react';
import { CommunityPost, VibroSession } from '../types';
import { storage } from '../services/storage';
import {
  Users,
  MessageSquare,
  Heart,
  Share2,
  Download,
  Plus,
  Sparkles,
  Search,
  CheckCircle2,
  Tag,
  Radio,
  Send,
  Sliders
} from 'lucide-react';

interface Props {
  onImportSession: (session: VibroSession) => void;
}

export const CommunityForum: React.FC<Props> = ({ onImportSession }) => {
  const [posts, setPosts] = useState<CommunityPost[]>(() => storage.getCommunityPosts());
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New post form state
  const [newTitle, setNewTitle] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('Pain Management');
  const [newTags, setNewTags] = useState('432Hz, VagusReset');

  const categories = [
    'all',
    'Pain Management',
    'Sleep & Insomnia',
    'Anxiety & Trauma',
    'Hardware & Vibro Beds',
    'Clinical Research'
  ];

  const filteredPosts = posts.filter(post => {
    const matchesCat = activeCategory === 'all' || post.category === activeCategory;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      post.title.toLowerCase().includes(query) ||
      post.content.toLowerCase().includes(query) ||
      post.author.name.toLowerCase().includes(query) ||
      post.tags.some(t => t.toLowerCase().includes(query));

    return matchesCat && matchesSearch;
  });

  const handleLike = (id: string) => {
    setPosts(prev =>
      prev.map(p => {
        if (p.id === id) {
          const isLiked = p.isLiked;
          return {
            ...p,
            likes: isLiked ? p.likes - 1 : p.likes + 1,
            isLiked: !isLiked
          };
        }
        return p;
      })
    );
  };

  const handleShareLink = (post: CommunityPost) => {
    const shareUrl = `${window.location.origin}/#recipe-${post.id}`;
    navigator.clipboard?.writeText(shareUrl);
    setCopiedId(post.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const newPost: CommunityPost = {
      id: `post-${Date.now()}`,
      author: {
        id: `user-${Date.now()}`,
        name: newAuthor || 'Resonant Healer',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        badge: 'Community Contributor'
      },
      title: newTitle,
      content: newContent,
      tags: newTags.split(',').map(t => t.trim()).filter(Boolean),
      category: newCategory,
      createdAt: 'Just now',
      likes: 1,
      isLiked: true,
      commentsCount: 0,
      sharedRecipe: {
        id: `shared-recipe-${Date.now()}`,
        title: newTitle,
        subtitle: 'Community Shared Harmonic Recipe',
        description: newContent,
        category: newCategory,
        durationMinutes: 15,
        phases: [
          {
            id: 'sh-p1',
            name: 'Harmonic Attunement',
            durationSeconds: 900,
            frequencyId: 'freq-432-pain',
            frequencyHz: 432,
            waveform: 'sine',
            ambientSound: 'ocean',
            ambientVolume: 35,
            hapticIntensity: 50
          }
        ],
        difficulty: 'Beginner',
        targetGoals: ['Somatic Coherence', 'Fascia Release'],
        voiceGuidance: true,
        coverGradient: 'from-cyan-600 via-indigo-600 to-purple-900',
        author: newAuthor || 'Community Member',
        rating: 5.0
      }
    };

    const updated = storage.saveCommunityPost(newPost);
    setPosts(updated);
    setIsShareModalOpen(false);
    setNewTitle('');
    setNewContent('');
  };

  return (
    <div className="space-y-6" id="community-forum-section">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" />
            <span>Resonance Global Network</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Community & Frequency Exchange
          </h2>
          <p className="text-slate-400 text-sm mt-0.5">
            Discover peer-reviewed vibroacoustic protocols, hardware setups, and patient recovery stories.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsShareModalOpen(true)}
            id="share-recipe-btn"
            className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 shadow-lg shadow-cyan-500/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Publish Recipe / Discussion</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto pb-1 scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-medium border transition ${
                activeCategory === cat
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                  : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              {cat === 'all' ? 'All Discussions' : cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search discussions & recipes..."
            className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
          />
        </div>
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {filteredPosts.map(post => (
          <div
            key={post.id}
            id={`post-card-${post.id}`}
            className="p-5 md:p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4 transition hover:bg-slate-900/90"
          >
            {/* Post Author Row */}
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <img
                  src={post.author.avatar}
                  alt={post.author.name}
                  className="w-10 h-10 rounded-full object-cover border border-cyan-500/40"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <strong className="text-sm font-semibold text-white">
                      {post.author.name}
                    </strong>
                    {post.author.badge && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                        {post.author.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {post.category} • {post.createdAt}
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleShareLink(post)}
                className="text-xs text-slate-400 hover:text-cyan-300 flex items-center space-x-1 p-1.5 rounded-lg hover:bg-slate-800 transition"
                title="Copy Recipe Link"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span className="text-[11px]">{copiedId === post.id ? 'Copied URL!' : 'Share'}</span>
              </button>
            </div>

            {/* Post Body */}
            <div>
              <h3 className="text-base font-bold text-white mb-1.5">{post.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                {post.content}
              </p>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5">
              {post.tags.map(t => (
                <span
                  key={t}
                  className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-950 text-slate-400 border border-slate-800"
                >
                  #{t}
                </span>
              ))}
            </div>

            {/* Embedded Recipe Card (If attached) */}
            {post.sharedRecipe && (
              <div className="p-4 rounded-xl bg-gradient-to-r from-slate-950 via-cyan-950/20 to-slate-950 border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center text-cyan-300">
                    <Radio className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 block">
                      Attached Vibroacoustic Recipe • {post.sharedRecipe.durationMinutes} Min
                    </span>
                    <strong className="text-xs text-white">
                      {post.sharedRecipe.title}
                    </strong>
                  </div>
                </div>

                <button
                  onClick={() => onImportSession(post.sharedRecipe!)}
                  className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center space-x-1.5 transition shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Load Into My Player</span>
                </button>
              </div>
            )}

            {/* Post Actions Footer */}
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => handleLike(post.id)}
                  className={`flex items-center space-x-1.5 transition ${
                    post.isLiked ? 'text-rose-400' : 'hover:text-rose-300'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-current' : ''}`} />
                  <span>{post.likes} Resonance Claps</span>
                </button>

                <div className="flex items-center space-x-1.5">
                  <MessageSquare className="w-4 h-4" />
                  <span>{post.commentsCount} comments</span>
                </div>
              </div>

              <span className="text-[11px] text-slate-500">Verified Protocol</span>
            </div>
          </div>
        ))}
      </div>

      {/* Create Discussion / Recipe Modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">
                Share Protocol or Post Discussion
              </h3>
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Your Name / Handle</label>
                <input
                  type="text"
                  value={newAuthor}
                  onChange={e => setNewAuthor(e.target.value)}
                  placeholder="e.g. Maya Chen, Sound Therapist"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Discussion Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. 174 Hz + 528 Hz cascade resolved my chronic hamstring strain"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-slate-200"
                >
                  <option value="Pain Management">Pain Management</option>
                  <option value="Sleep & Insomnia">Sleep & Insomnia</option>
                  <option value="Anxiety & Trauma">Anxiety & Trauma</option>
                  <option value="Hardware & Vibro Beds">Hardware & Vibro Beds</option>
                  <option value="Clinical Research">Clinical Research</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Description & Experience *</label>
                <textarea
                  required
                  rows={3}
                  value={newContent}
                  onChange={e => setNewContent(e.target.value)}
                  placeholder="Describe your session structure, equipment used, and physiological changes experienced..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  value={newTags}
                  onChange={e => setNewTags(e.target.value)}
                  placeholder="432Hz, VagusReset, FasciaRelease"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-slate-200"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsShareModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold"
                >
                  Publish to Community
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
