import React, { useState } from 'react';
import { 
  MapPin, 
  MessageCircle, 
  Heart, 
  Share2, 
  MoreHorizontal, 
  Image as ImageIcon, 
  Sparkles, 
  Send,
  PlusCircle,
  Tag,
  Check,
  Trash2,
  Copy
} from 'lucide-react';
import { Post } from '../types';
import { useCommunity } from '../context/CommunityContext';
import { CreatePostModal } from './modals/CreatePostModal';
import { PostDetailCommentsModal } from './modals/PostDetailCommentsModal';
import { LocalHubLogo } from './LocalHubLogo';
import { Megaphone } from 'lucide-react';

export function CommunityFeed() {
  const { posts, toggleLikePost, deletePost, userProfile, showToast, openContactAdminModal } = useCommunity();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPostForComments, setSelectedPostForComments] = useState<Post | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('ทั้งหมด');

  const categories = [
    'ทั้งหมด', 'ข่าวสารชุมชน', 'ตามหาของ/สัตว์เลี้ยง', 'ร้านอร่อยชุมชน', 'ประกาศทั่วไป', 'ขอความช่วยเหลือ'
  ];

  const filteredPosts = selectedCategory === 'ทั้งหมด'
    ? posts
    : posts.filter(p => p.category === selectedCategory);

  // Sync active modal post if open
  const activeModalPost = selectedPostForComments 
    ? posts.find(p => p.id === selectedPostForComments.id) || selectedPostForComments
    : null;

  return (
    <div className="pb-28 pt-4 animate-in fade-in duration-300 bg-slate-50/60 min-h-screen">
      
      {/* Sticky Frosted Header */}
      <div className="bg-white/90 backdrop-blur-xl px-5 pt-7 pb-4 border-b border-slate-200/70 sticky top-0 z-30 shadow-sm">
        <div className="flex items-center justify-between mb-3.5">
          <LocalHubLogo size="sm" variant="dark" showSubtitle={false} />
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => openContactAdminModal('pr_request')}
              className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-extrabold px-2.5 py-1 rounded-xl border border-indigo-200/80 flex items-center gap-1.5 transition-colors shadow-xs"
              title="ส่งเรื่องขอประชาสัมพันธ์หรือแจ้งข่าวถึงแอดมิน"
            >
              <Megaphone size={12} className="text-indigo-600" />
              <span>ขอประชาสัมพันธ์</span>
            </button>

            <span className="bg-emerald-50 text-emerald-700 text-[11px] font-extrabold px-2.5 py-1 rounded-xl border border-emerald-100 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              ชุมชนสด
            </span>
          </div>
        </div>
        
        {/* Create Post Input Bar */}
        <div 
          onClick={() => setShowCreateModal(true)}
          className="flex gap-3 items-center bg-white p-2.5 rounded-2xl border border-slate-200/80 shadow-sm hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <img 
            src={userProfile.avatar} 
            alt="Me" 
            className="w-9 h-9 rounded-xl object-cover ring-2 ring-emerald-500/20 shrink-0" 
          />
          <div className="flex-1 bg-slate-50 text-slate-400 group-hover:text-slate-600 px-3.5 py-2 rounded-xl text-[13px] font-medium border border-slate-100 transition-colors">
            มีอะไรเกิดขึ้นในพื้นที่? แชร์กับเพื่อนบ้าน...
          </div>
          <button 
            type="button"
            title="แนบรูปภาพ"
            className="w-8 h-8 rounded-xl bg-slate-50 group-hover:bg-emerald-50 text-slate-500 group-hover:text-emerald-600 flex items-center justify-center transition-colors shrink-0"
          >
            <ImageIcon size={18} />
          </button>
        </div>

        {/* Category Horizontal Pills */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pt-3 -mx-5 px-5">
          {categories.map((cat, idx) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={idx}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-[12px] font-bold whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                    : 'bg-white border-slate-200/90 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Feed Posts */}
      <div className="p-4 space-y-3.5 max-w-md mx-auto">
        {filteredPosts.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl text-center border border-slate-200 text-slate-400 text-[13px]">
            ยังไม่มีโพสต์ในหมวดหมู่นี้ เป็นคนแรกที่โพสต์เรื่องราว!
          </div>
        ) : (
          filteredPosts.map(post => (
            <PostCard 
              key={post.id} 
              post={post}
              isMyPost={post.author.name === userProfile.name}
              onLike={() => toggleLikePost(post.id)}
              onOpenComments={() => setSelectedPostForComments(post)}
              onDelete={() => deletePost(post.id)}
            />
          ))
        )}
      </div>

      {/* Modals */}
      {showCreateModal && <CreatePostModal onClose={() => setShowCreateModal(false)} />}
      {activeModalPost && (
        <PostDetailCommentsModal 
          post={activeModalPost} 
          onClose={() => setSelectedPostForComments(null)} 
        />
      )}

    </div>
  );
}

interface PostCardProps {
  post: Post;
  isMyPost?: boolean;
  onLike: () => void;
  onOpenComments: () => void;
  onDelete: () => void;
}

const PostCard: React.FC<PostCardProps> = ({ 
  post, 
  isMyPost,
  onLike, 
  onOpenComments, 
  onDelete 
}) => {
  const { showToast, openMediaViewer } = useCommunity();
  const [showMenu, setShowMenu] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setIsCopied(true);
    showToast('🔗 คัดลอกลิงก์โพสต์เรียบร้อยแล้ว');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleCopyText = () => {
    navigator.clipboard?.writeText(post.content);
    showToast('คัดลอกข้อความโพสต์แล้ว');
    setShowMenu(false);
  };

  return (
    <div className="bg-white rounded-[26px] p-5 border border-slate-200/80 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.03)] hover:shadow-md transition-all relative">
      {/* Author Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex gap-3">
          <img 
            src={post.author.avatar} 
            alt={post.author.name} 
            className="w-10 h-10 rounded-2xl object-cover ring-2 ring-slate-100 shrink-0" 
          />
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-extrabold text-slate-900 text-[14px] leading-tight">{post.author.name}</h3>
              {post.category && (
                <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                  {post.category}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 mt-1">
              <span>{post.time}</span>
              <span>•</span>
              <span className="flex items-center text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-bold">
                <MapPin size={10} className="mr-0.5" />
                ต.{post.location.subdistrict} {post.location.distance ? `(${post.location.distance} กม.)` : ''}
              </span>
            </div>
          </div>
        </div>

        <div className="relative">
          <button 
            onClick={() => setShowMenu(prev => !prev)}
            title="เพิ่มเติม"
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-xl transition-colors"
          >
            <MoreHorizontal size={18} />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-full mt-1 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 w-36 z-20 text-[12px] font-bold text-slate-700">
              <button
                onClick={handleCopyText}
                className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center gap-2"
              >
                <Copy size={13} />
                คัดลอกข้อความ
              </button>
              {isMyPost && (
                <button
                  onClick={() => { setShowMenu(false); onDelete(); }}
                  className="w-full px-3 py-2 text-left text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                >
                  <Trash2 size={13} />
                  ลบโพสต์นี้
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <p className="text-[13.5px] font-normal text-slate-800 mb-3.5 whitespace-pre-wrap leading-relaxed">
        {post.content}
      </p>

      {/* Image Attachment (if any) */}
      {post.images && post.images.length > 0 ? (
        <div className={`mb-4 grid gap-1.5 rounded-2xl overflow-hidden border border-slate-150 ${post.images.length === 1 ? 'grid-cols-1' : post.images.length === 2 ? 'grid-cols-2' : post.images.length === 3 ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-4'}`}>
          {post.images.map((img, idx) => {
            // Only show up to 4 images in the grid preview
            if (idx > 3) return null;
            const isLastVisible = idx === 3 && post.images!.length > 4;
            
            return (
              <div 
                key={idx}
                onClick={() => openMediaViewer({
                  url: img,
                  type: 'image',
                  title: `โพสต์โดย ${post.author.name} (${idx + 1}/${post.images!.length})`,
                  subtitle: `ต.${post.location.subdistrict} • ${post.time}`
                })}
                className={`relative bg-slate-900 cursor-pointer group ${post.images!.length === 1 ? 'max-h-72' : 'aspect-square'}`}
              >
                <img 
                  src={img} 
                  alt={`ภาพประกอบโพสต์ ${idx + 1}`} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                />
                
                {isLastVisible && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="text-white text-xl font-extrabold">+{post.images!.length - 4}</span>
                  </div>
                )}
                
                {!isLastVisible && (
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <span className="bg-black/75 backdrop-blur-md text-white text-[11px] font-extrabold px-3 py-1 rounded-full border border-white/20">
                      ดูรูปภาพ
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : post.image ? (
        <div 
          onClick={() => openMediaViewer({
            url: post.image!,
            type: 'image',
            title: `โพสต์โดย ${post.author.name}`,
            subtitle: `ต.${post.location.subdistrict} • ${post.time}`
          })}
          className="mb-4 rounded-2xl overflow-hidden border border-slate-150 bg-slate-900 max-h-72 cursor-pointer relative group"
        >
          <img 
            src={post.image} 
            alt="ภาพประกอบโพสต์" 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
          />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
            <span className="bg-black/75 backdrop-blur-md text-white text-[11px] font-extrabold px-3 py-1 rounded-full border border-white/20">
              แตะเพื่อดูภาพเต็มจอ
            </span>
          </div>
        </div>
      ) : null}

      {/* Stats Bar */}
      <div className="flex justify-between items-center text-[12px] font-bold text-slate-400 border-b border-slate-100 pb-2.5 mb-2">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-full bg-rose-50 flex items-center justify-center">
            <Heart size={11} className="fill-rose-500 text-rose-500" />
          </div>
          <span className="text-slate-600">{post.likes} คนถูกใจ</span>
        </div>
        <span 
          onClick={onOpenComments}
          className="text-slate-500 hover:text-emerald-700 cursor-pointer transition-colors"
        >
          {post.comments} ความคิดเห็น
        </span>
      </div>

      {/* Actions */}
      <div className="flex justify-between gap-1 pt-0.5">
        <button 
          onClick={onLike}
          className={`flex-1 flex items-center justify-center gap-1.5 text-[12.5px] py-2 rounded-xl transition-colors font-bold active:scale-95 ${
            post.isLiked 
              ? 'text-rose-600 bg-rose-50 font-extrabold' 
              : 'text-slate-600 hover:text-rose-600 hover:bg-rose-50/70'
          }`}
        >
          <Heart size={16} className={post.isLiked ? 'fill-rose-600' : ''} />
          {post.isLiked ? 'ถูกใจแล้ว' : 'ถูกใจ'}
        </button>

        <button 
          onClick={onOpenComments}
          className="flex-1 flex items-center justify-center gap-1.5 text-[12.5px] text-slate-600 hover:text-emerald-600 hover:bg-emerald-50/70 py-2 rounded-xl transition-colors font-bold active:scale-95"
        >
          <MessageCircle size={16} />
          คอมเมนต์
        </button>

        <button 
          onClick={handleShare}
          className="flex-1 flex items-center justify-center gap-1.5 text-[12.5px] text-slate-600 hover:text-blue-600 hover:bg-blue-50/70 py-2 rounded-xl transition-colors font-bold active:scale-95"
        >
          {isCopied ? <Check size={16} className="text-emerald-600" /> : <Share2 size={16} />}
          {isCopied ? 'คัดลอกแล้ว' : 'แชร์'}
        </button>
      </div>
    </div>
  );
}
