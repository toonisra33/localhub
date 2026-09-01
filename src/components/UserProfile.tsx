import React, { useState } from 'react';
import { 
  Settings, 
  FileText, 
  Store, 
  Bookmark, 
  MapPin, 
  AlertTriangle, 
  ChevronRight, 
  Shield, 
  Award, 
  Radio, 
  UserCheck, 
  Lock,
  Clock,
  Sparkles,
  Edit3,
  CheckCircle2
} from 'lucide-react';
import { useBroadcast } from '../context/BroadcastContext';
import { useCommunity } from '../context/CommunityContext';
import { SettingsModal } from './modals/SettingsModal';
import { EditProfileModal } from './modals/EditProfileModal';
import { IdVerificationModal } from './modals/IdVerificationModal';
import { LocationPickerModal } from './modals/LocationPickerModal';
import { FoodGuideModal } from './modals/FoodGuideModal';
import { LocalHubLogo } from './LocalHubLogo';

export function UserProfile() {
  const { 
    role, 
    setRole, 
    setOpenAdminModal, 
    activeBroadcast, 
    deviceRemainingSeconds 
  } = useBroadcast();

  const { 
    userProfile, 
    location, 
    posts, 
    products, 
    alerts, 
    setActiveTab, 
    showToast 
  } = useCommunity();

  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);

  const myPostsCount = posts.filter(p => p.author.name === userProfile.name).length;
  const myProductsCount = products.filter(p => p.seller === userProfile.name).length;

  const menuItems = [
    { 
      icon: FileText, 
      label: 'โพสต์ของฉัน', 
      count: myPostsCount, 
      onClick: () => {
        setActiveTab('community');
        showToast(`กำลังแสดงโพสต์ของคุณ (${myPostsCount} รายการ)`);
      }
    },
    { 
      icon: Store, 
      label: 'ร้านของฉัน / สินค้าที่ขาย', 
      count: myProductsCount, 
      onClick: () => {
        setActiveTab('market');
        showToast(`กำลังเปิดตลาดสินค้าของคุณ (${myProductsCount} รายการ)`);
      }
    },
    { 
      icon: Bookmark, 
      label: 'ประกาศที่บันทึกไว้', 
      count: 3, 
      onClick: () => {
        showToast('เปิดรายการประกาศที่บันทึกไว้');
      }
    },
    { 
      icon: MapPin, 
      label: 'พื้นที่ที่ติดตาม', 
      count: 1, 
      onClick: () => setShowLocationModal(true)
    },
    { 
      icon: AlertTriangle, 
      label: 'เหตุการณ์ที่รายงาน', 
      count: alerts.length, 
      onClick: () => {
        setActiveTab('home');
        showToast('กำลังแสดงเหตุการณ์ที่คุณและเพื่อนบ้านรายงาน');
      }
    },
  ];

  return (
    <div className="pb-28 pt-4 animate-in fade-in duration-300 bg-slate-50/60 min-h-screen">
      
      {/* Profile Header */}
      <div className="bg-white/95 backdrop-blur-xl px-5 pt-7 pb-7 shadow-sm border-b border-slate-200/80 rounded-b-[36px]">
        <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100">
          <LocalHubLogo size="sm" variant="dark" showSubtitle={false} />
          <div className="flex items-center gap-2">
            {/* Quick Role Badge */}
            <span className={`text-[11px] font-extrabold px-3 py-1 rounded-full border shadow-sm ${
              role === 'admin' 
                ? 'bg-rose-50 text-rose-700 border-rose-200' 
                : 'bg-slate-100 text-slate-700 border-slate-200'
            }`}>
              {role === 'admin' ? '👑 แอดมิน' : '👤 สมาชิก'}
            </span>
            <button 
              onClick={() => setShowSettingsModal(true)}
              title="ตั้งค่า"
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <Settings size={18} />
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative group cursor-pointer" onClick={() => setShowEditProfileModal(true)}>
            <img 
              src={role === 'admin' ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200" : userProfile.avatar} 
              alt="Profile" 
              className="w-18 h-18 rounded-2xl object-cover ring-4 ring-slate-100 shadow-md group-hover:scale-105 transition-transform" 
            />
            <div className={`absolute -bottom-1 -right-1 text-white p-1.5 rounded-xl border-2 border-white shadow-md ${
              role === 'admin' ? 'bg-rose-600' : 'bg-emerald-600'
            }`}>
              <Shield size={12} strokeWidth={3} />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h2 className="text-[17px] font-extrabold text-slate-900 tracking-tight truncate">
                {role === 'admin' ? 'แอดมินศูนย์ควบคุมชุมชน' : userProfile.name}
              </h2>
              <button
                onClick={() => setShowEditProfileModal(true)}
                className="text-slate-400 hover:text-emerald-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                title="แก้ไขข้อมูล"
              >
                <Edit3 size={15} />
              </button>
            </div>

            <p className="text-[12.5px] font-medium text-slate-500 flex items-center gap-1 mt-0.5">
              <MapPin size={13} className="text-emerald-600 shrink-0" />
              <span className="truncate">{location.district}, {location.province}</span>
            </p>

            <div className="mt-2 flex items-center gap-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-3 py-0.5 rounded-full text-[11.5px] font-extrabold border border-emerald-100">
                <Award size={13} className="text-amber-500" /> 
                {role === 'admin' ? 'ผู้ดูแลระบบสูงสุด' : `คะแนนชุมชน: ${userProfile.reputationScore}`}
              </span>

              {userProfile.isVerified && (
                <span className="inline-flex items-center gap-0.5 bg-sky-50 text-sky-700 px-2 py-0.5 rounded-full text-[10.5px] font-extrabold border border-sky-100">
                  <CheckCircle2 size={11} className="text-sky-600" />
                  ยืนยันแล้ว
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Role Switcher (For Testing Admin / User experience) */}
      <div className="px-5 mt-5">
        <div className="bg-white p-4 rounded-[24px] border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <UserCheck size={16} />
              </div>
              <span className="text-[13px] font-extrabold text-slate-800">สลับสิทธิ์การใช้งาน (Role Switcher)</span>
            </div>
            <span className="text-[11px] font-bold text-slate-400">โหมดทดสอบ</span>
          </div>
          
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/60">
            <button
              onClick={() => {
                setRole('admin');
                showToast('สลับเป็นโหมด ผู้ดูแลระบบ (Admin)');
              }}
              className={`py-2 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 ${
                role === 'admin'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Shield size={14} className={role === 'admin' ? 'text-rose-400' : ''} />
              แอดมิน (Admin)
            </button>
            <button
              onClick={() => {
                setRole('user');
                showToast('สลับเป็นโหมด สมาชิกทั่วไป (User)');
              }}
              className={`py-2 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 ${
                role === 'user'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Lock size={14} />
              ผู้ใช้ทั่วไป (User)
            </button>
          </div>
        </div>
      </div>

      {/* Admin Broadcast Card */}
      <div className="px-5 mt-4">
        {role === 'admin' ? (
          <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-rose-950 rounded-[28px] p-5 text-white shadow-xl relative overflow-hidden border border-rose-500/20">
            <div className="flex items-start justify-between relative z-10 mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-rose-500/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-rose-400 border border-rose-500/30">
                  <Radio size={19} className="animate-pulse" />
                </div>
                <div>
                  <h3 className="font-extrabold text-[15.5px] tracking-tight">ศูนย์ควบคุมบรอดแคสแอดมิน</h3>
                  <p className="text-[11.5px] text-slate-300 font-medium">ส่งข่าวสาร สาระดีๆ สินค้า หรือแจ้งเตือนด่วน</p>
                </div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-3.5 text-[12px] text-white/90 mb-4 border border-white/10 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-300">สถานะบรอดแคส:</span>
                {activeBroadcast ? (
                  <span className="bg-rose-500 text-white text-[10.5px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                    กำลังแพร่ภาพ ({Math.floor(deviceRemainingSeconds / 60)}:{String(deviceRemainingSeconds % 60).padStart(2, '0')} น.)
                  </span>
                ) : (
                  <span className="text-slate-400">ไม่มีการบรอดแคสในขณะนี้</span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                ข้อความจะเลื่อนตามและล็อกบนหน้าจอทุกอุปกรณ์ 3 นาทีขณะเลื่อนดู และรีเซ็ตอัตโนมัติ 00:00 น.
              </p>
            </div>

            <button 
              onClick={() => setOpenAdminModal(true)}
              className="w-full bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-[13px] font-extrabold py-3 px-4 rounded-2xl transition-all shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 border border-rose-400/40 active:scale-95"
            >
              <Radio size={16} />
              {activeBroadcast ? 'จัดการ / ส่งบรอดแคสใหม่' : 'สร้างและส่งบรอดแคสด่วน'}
            </button>
          </div>
        ) : (
          <div className="bg-white border border-slate-200/80 rounded-[24px] p-4 text-slate-500 flex items-center gap-3 shadow-sm">
            <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 shrink-0">
              <Lock size={17} />
            </div>
            <div className="text-[12px]">
              <p className="font-bold text-slate-800">สิทธิ์บรอดแคสสงวนไว้สำหรับแอดมิน</p>
              <p className="text-slate-500">ผู้ใช้งานทั่วไปไม่สามารถส่งสัญญาณบรอดแคสได้</p>
            </div>
          </div>
        )}
      </div>

      {/* Menu List */}
      <div className="px-5 mt-5 space-y-2.5">
        {menuItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button 
              key={idx}
              onClick={item.onClick}
              className="w-full bg-white flex items-center justify-between p-4 rounded-2xl border border-slate-200/80 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.03)] hover:border-emerald-300 hover:shadow-md transition-all group active:scale-[0.99]"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                  <Icon size={18} strokeWidth={2.4} />
                </div>
                <span className="font-bold text-slate-800 text-[13.5px]">{item.label}</span>
              </div>
              <div className="flex items-center gap-3">
                {item.count > 0 && (
                  <span className="bg-slate-100 text-slate-600 text-[11.5px] font-extrabold px-2.5 py-0.5 rounded-full">
                    {item.count}
                  </span>
                )}
                <ChevronRight size={17} className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
              </div>
            </button>
          );
        })}
      </div>
      
      {/* Verify Identity Banner */}
      <div className="px-5 mt-6">
        <div className="bg-gradient-to-br from-emerald-600 to-teal-800 rounded-[28px] p-5 text-white shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
             <Shield size={130} />
          </div>
          <h3 className="font-extrabold text-[15.5px] mb-1 relative z-10 flex items-center gap-2">
            <Shield size={18} />
            {userProfile.isVerified ? 'ยืนยันตัวตนในพื้นที่เรียบร้อยแล้ว' : 'ยืนยันตัวตนในพื้นที่'}
          </h3>
          <p className="text-[12px] font-medium text-emerald-50/90 mb-4 relative z-10 leading-relaxed max-w-[85%]">
            {userProfile.isVerified 
              ? 'คุณได้รับตราสัญลักษณ์สมาชิกที่ยืนยันแล้ว สามารถซื้อขายและรายงานเหตุด้วยความน่าเชื่อถือสูงสุด'
              : 'ยืนยันตัวตนด้วยบัตรประชาชนเพื่อรับป้าย "สมาชิกที่ยืนยันแล้ว" เพิ่มความน่าเชื่อถือ'}
          </p>
          <button 
            onClick={() => setShowVerificationModal(true)}
            className="bg-white text-emerald-800 text-[12.5px] font-extrabold px-5 py-2.5 rounded-2xl relative z-10 hover:bg-emerald-50 transition-all shadow-md active:scale-95"
          >
            {userProfile.isVerified ? 'ดูสถานะการยืนยันตัวตน' : 'เริ่มยืนยันตัวตน'}
          </button>
        </div>
      </div>

      {/* Modals */}
      {showSettingsModal && <SettingsModal onClose={() => setShowSettingsModal(false)} />}
      {showEditProfileModal && <EditProfileModal onClose={() => setShowEditProfileModal(false)} />}
      {showVerificationModal && <IdVerificationModal onClose={() => setShowVerificationModal(false)} />}
      {showLocationModal && <LocationPickerModal onClose={() => setShowLocationModal(false)} />}

    </div>
  );
}
