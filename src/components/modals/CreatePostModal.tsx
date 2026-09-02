import React, { useState } from 'react';
import { X, Image as ImageIcon, Send, Sparkles, MapPin, Tag } from 'lucide-react';
import { useCommunity } from '../../context/CommunityContext';

interface CreatePostModalProps {
  onClose: () => void;
}

export function CreatePostModal({ onClose }: CreatePostModalProps) {
  const { location, addPost, showToast, userProfile, openMediaViewer } = useCommunity();
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('ข่าวสารชุมชน');
  const [images, setImages] = useState<string[]>([]);
  const [isAttaching, setIsAttaching] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const categories = [
    'ข่าวสารชุมชน', 'ตามหาของ/สัตว์เลี้ยง', 'ร้านอร่อยชุมชน', 'ประกาศทั่วไป', 'ขอความช่วยเหลือ', 'พูดคุยแลกเปลี่ยน'
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remainingSlots = 10 - images.length;
    if (remainingSlots <= 0) {
      showToast('สามารถอัปโหลดได้สูงสุด 10 รูป', 'error');
      return;
    }

    const filesArray = Array.from(files).slice(0, remainingSlots);
    setIsAttaching(true);

    let processedCount = 0;
    const newImages: string[] = [];

    filesArray.forEach(file => {
      if (!file.type.startsWith('image/')) {
        processedCount++;
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        showToast(`ไฟล์ ${file.name} มีขนาดใหญ่เกิน 5 MB`, 'error');
        processedCount++;
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          newImages.push(result);
        }
        processedCount++;
        
        if (processedCount === filesArray.length) {
          setImages(prev => [...prev, ...newImages]);
          setIsAttaching(false);
          showToast(`🖼️ แนบรูปภาพประกอบแล้ว ${newImages.length} รูป`, 'success');
        }
      };
      reader.readAsDataURL(file);
    });
    
    if (filesArray.length === 0) {
      setIsAttaching(false);
    }
    
    // Clear input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      showToast('กรุณากรอกข้อความที่ต้องการแชร์', 'error');
      return;
    }

    addPost(content.trim(), category, images.length > 0 ? images : undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[80] bg-slate-950/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-t-[32px] sm:rounded-[32px] max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 pb-3.5 border-b border-slate-150 bg-white z-10 shrink-0">
          <div className="flex items-center gap-2.5">
            <img
              src={userProfile.avatar}
              alt={userProfile.name}
              className="w-10 h-10 rounded-2xl object-cover ring-2 ring-emerald-500/20"
            />
            <div>
              <h2 className="text-[16px] font-extrabold text-slate-900 leading-tight">สร้างโพสต์ใหม่</h2>
              <div className="flex items-center gap-1 text-[11.5px] text-slate-500 font-medium">
                <MapPin size={11} className="text-emerald-600" />
                <span>ต.{location.subdistrict} • {location.district}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          
          {/* Category picker */}
          <div>
            <label className="block text-[11.5px] font-bold text-slate-600 mb-1.5">หมวดหมู่โพสต์</label>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1 rounded-full text-[11.5px] font-bold transition-all border ${
                    category === cat
                      ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Text Area */}
          <div>
            <textarea
              rows={4}
              required
              placeholder="มีเรื่องราว ข่าวสาร หรือสิ่งที่ต้องการแชร์กับคนในละแวกบ้าน?..."
              value={content}
              onChange={e => setContent(e.target.value)}
              className="w-full p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-[14px] font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 focus:bg-white transition-all resize-none leading-relaxed"
            />
          </div>

          {/* Image Preview / Attachment */}
          {images.length > 0 ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {images.map((img, idx) => (
                  <div key={idx} className="relative rounded-xl overflow-hidden border border-slate-200 aspect-square bg-slate-900 group">
                    <img 
                      src={img} 
                      alt={`Post attachment ${idx}`}
                      onClick={() => openMediaViewer({
                        url: img,
                        type: 'image',
                        title: `รูปภาพที่แนบ ${idx + 1}/${images.length}`,
                        subtitle: `หมวดหมู่: ${category}`
                      })}
                      className="w-full h-full object-cover cursor-pointer group-hover:scale-105 transition-transform duration-300" 
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-2 right-2 bg-slate-950/80 text-white p-1.5 rounded-full hover:bg-rose-600 transition-colors z-10"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
              
              {images.length < 10 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isAttaching}
                  className="w-full py-2 border border-dashed border-slate-300 hover:border-emerald-400 rounded-xl bg-slate-50 hover:bg-emerald-50/50 text-slate-500 hover:text-emerald-600 flex items-center justify-center gap-1.5 text-[12px] font-bold transition-all"
                >
                  <ImageIcon size={16} className={isAttaching ? 'animate-spin' : ''} />
                  <span>{isAttaching ? 'กำลังโหลดรูปภาพ...' : `เพิ่มรูปภาพ (${images.length}/10)`}</span>
                </button>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isAttaching}
              className="w-full py-3 border-2 border-dashed border-slate-200 hover:border-emerald-300 rounded-2xl bg-slate-50 hover:bg-emerald-50/40 text-slate-600 hover:text-emerald-600 flex items-center justify-center gap-2 text-[13px] font-bold transition-all"
            >
              <ImageIcon size={18} className={isAttaching ? 'animate-spin' : ''} />
              <span>{isAttaching ? 'กำลังโหลดรูปภาพ...' : 'อัปโหลดรูปภาพประกอบโพสต์ (สูงสุด 10 รูป)'}</span>
            </button>
          )}

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            multiple
            className="hidden"
          />

          {/* Submit */}
          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl border border-slate-200 text-slate-700 font-bold text-[13.5px] hover:bg-slate-50 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[13.5px] shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-1.5 active:scale-95"
            >
              <Send size={16} />
              เผยแพร่ทันที
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
