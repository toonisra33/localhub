import React, { useState } from 'react';
import { 
  MapPin, 
  Bell, 
  Cloud, 
  Navigation, 
  AlertTriangle, 
  ShieldCheck, 
  ThumbsUp, 
  ThumbsDown, 
  Camera, 
  Radio, 
  ChevronDown, 
  Store, 
  Briefcase, 
  Calendar, 
  Home, 
  Heart, 
  Clock, 
  Users, 
  AlertCircle,
  PlusCircle,
  Filter,
  CheckCircle2
} from 'lucide-react';
import { mockMorningBrief } from '../data';
import { Alert } from '../types';
import { useBroadcast } from '../context/BroadcastContext';
import { useCommunity } from '../context/CommunityContext';
import { IncidentReportModal } from './modals/IncidentReportModal';
import { FoodGuideModal } from './modals/FoodGuideModal';
import { LocalJobsModal } from './modals/LocalJobsModal';
import { CommunityEventsModal } from './modals/CommunityEventsModal';
import { RealEstateModal } from './modals/RealEstateModal';
import { EmergencyHelpModal } from './modals/EmergencyHelpModal';
import { LocationPickerModal } from './modals/LocationPickerModal';
import { NotificationCenterModal } from './modals/NotificationCenterModal';
import { LocalHubLogo } from './LocalHubLogo';

export function HomeFeed() {
  const { role, setOpenAdminModal } = useBroadcast();
  const { 
    location, 
    alerts, 
    voteAlert, 
    setActiveTab, 
    unreadNotificationsCount, 
    showToast 
  } = useCommunity();

  // Modals state
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [showFoodModal, setShowFoodModal] = useState(false);
  const [showJobsModal, setShowJobsModal] = useState(false);
  const [showEventsModal, setShowEventsModal] = useState(false);
  const [showRealEstateModal, setShowRealEstateModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [alertFilter, setAlertFilter] = useState<'all' | 'flood' | 'road' | 'power'>('all');

  const quickMenus = [
    { 
      icon: AlertTriangle, 
      label: 'แจ้งเหตุ', 
      color: 'bg-red-500/10 text-red-600', 
      border: 'border-red-200/50', 
      onClick: () => setShowIncidentModal(true) 
    },
    { 
      icon: Navigation, 
      label: 'กินอะไรดี', 
      color: 'bg-amber-500/10 text-amber-600', 
      border: 'border-amber-200/50', 
      onClick: () => setShowFoodModal(true) 
    },
    { 
      icon: Store, 
      label: 'ตลาด', 
      color: 'bg-emerald-500/10 text-emerald-600', 
      border: 'border-emerald-200/50', 
      onClick: () => setActiveTab('market') 
    },
    { 
      icon: Briefcase, 
      label: 'หางาน', 
      color: 'bg-blue-500/10 text-blue-600', 
      border: 'border-blue-200/50', 
      onClick: () => setShowJobsModal(true) 
    },
    { 
      icon: Calendar, 
      label: 'กิจกรรม', 
      color: 'bg-purple-500/10 text-purple-600', 
      border: 'border-purple-200/50', 
      onClick: () => setShowEventsModal(true) 
    },
    { 
      icon: Home, 
      label: 'บ้าน/ที่ดิน', 
      color: 'bg-teal-500/10 text-teal-600', 
      border: 'border-teal-200/50', 
      onClick: () => setShowRealEstateModal(true) 
    },
    { 
      icon: Heart, 
      label: 'ช่วยเหลือ', 
      color: 'bg-pink-500/10 text-pink-600', 
      border: 'border-pink-200/50', 
      onClick: () => setShowHelpModal(true) 
    },
  ];

  const filteredAlerts = alertFilter === 'all' 
    ? alerts 
    : alerts.filter(a => a.type === alertFilter);

  return (
    <div className="pb-28 animate-in fade-in duration-300 bg-slate-50/60 min-h-screen">
      
      {/* Header / Location Selection with Modern Obsidian Gradient */}
      <div className="bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 text-white pt-10 pb-9 px-5 rounded-b-[36px] shadow-[0_12px_40px_rgba(0,0,0,0.18)] sticky top-0 z-10 border-b border-slate-800/80">
        
        {/* Top App Brand Bar */}
        <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-slate-800/70">
          <LocalHubLogo size="sm" variant="light" showSubtitle={true} />
          
          <div className="flex items-center gap-2">
            {/* Admin Broadcast Quick Action (Admin Only) */}
            {role === 'admin' && (
              <button
                onClick={() => setOpenAdminModal(true)}
                className="h-8 px-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-xl flex items-center gap-1 transition-all shadow-md shadow-red-500/25 text-[11px] font-extrabold border border-red-400/40 active:scale-95"
                title="ส่งสัญญาณบรอดแคส (Admin Only)"
              >
                <Radio size={13} className="animate-pulse" />
                <span>บรอดแคส</span>
              </button>
            )}

            {/* Notification Bell */}
            <button 
              onClick={() => setShowNotificationsModal(true)}
              className="w-8 h-8 bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 rounded-xl flex items-center justify-center transition-all relative border border-slate-700/80 shadow-inner"
              aria-label="การแจ้งเตือน"
            >
              <Bell size={16} />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-slate-900 animate-pulse" />
              )}
            </button>
          </div>
        </div>

        {/* Location Selector */}
        <div onClick={() => setShowLocationModal(true)} className="cursor-pointer group flex justify-between items-center bg-slate-800/40 hover:bg-slate-800/70 p-2.5 rounded-2xl border border-slate-800/80 transition-all">
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="inline-flex items-center gap-1 text-emerald-400 text-[10.5px] font-extrabold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                พื้นที่ปัจจุบัน
              </span>
            </div>
            
            <h1 className="text-[18px] font-extrabold tracking-tight flex items-center gap-1.5 text-white group-hover:text-emerald-300 transition-colors">
              {location.district}, {location.province}
            </h1>
            
            <p className="text-slate-400 text-[11.5px] font-medium mt-0.5 flex items-center gap-1">
              <MapPin size={11} className="text-emerald-400" />
              ต.{location.subdistrict} • {location.village}
            </p>
          </div>

          <div className="flex items-center gap-1 bg-slate-700/60 group-hover:bg-emerald-500/20 text-slate-300 group-hover:text-emerald-300 text-[11px] font-bold px-2.5 py-1.5 rounded-xl border border-slate-600/40 group-hover:border-emerald-400/40 transition-colors">
            <span>เปลี่ยน</span>
            <ChevronDown size={13} />
          </div>
        </div>
      </div>

      {/* Morning Brief - Frosted Modern Card */}
      <div className="px-5 -mt-6 relative z-20">
        <div className="bg-white/95 backdrop-blur-xl rounded-[28px] p-5 shadow-[0_10px_35px_-10px_rgba(0,0,0,0.07)] border border-slate-200/70">
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20 text-lg">
                ☀️
              </div>
              <div>
                <h2 className="font-extrabold text-slate-900 text-[15.5px] tracking-tight">สรุปประจำวันรอบตัวคุณ</h2>
                <p className="text-[11.5px] font-medium text-slate-500">อัปเดตสถานการณ์ล่าสุดในพื้นที่</p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
              สดวันนี้
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-2.5 text-[12.5px] font-medium">
            <div 
              onClick={() => showToast('☀️ สภาพอากาศวันนี้: แดดดี สลับมีเมฆ ลมพัดสบาย')}
              className="flex items-center gap-2.5 text-slate-700 bg-slate-50/90 hover:bg-slate-100/80 transition-colors p-2.5 rounded-2xl border border-slate-150/70 cursor-pointer"
            >
              <div className="w-7 h-7 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 font-bold">
                <Cloud size={16} />
              </div>
              <span className="truncate font-semibold">{mockMorningBrief.weather}</span>
            </div>

            <div 
              onClick={() => { setAlertFilter('road'); showToast('แสดงเฉพาะเหตุการณ์ปิดถนน/ซ่อมผิวจราจร'); }}
              className="flex items-center gap-2.5 text-slate-700 bg-slate-50/90 hover:bg-slate-100/80 transition-colors p-2.5 rounded-2xl border border-slate-150/70 cursor-pointer"
            >
              <div className="w-7 h-7 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 font-bold">
                <AlertTriangle size={16} />
              </div>
              <span className="truncate font-semibold">ปิดถนน {mockMorningBrief.roadClosures} จุด</span>
            </div>

            <div 
              onClick={() => setShowEventsModal(true)}
              className="flex items-center gap-2.5 text-slate-700 bg-slate-50/90 hover:bg-slate-100/80 transition-colors p-2.5 rounded-2xl border border-slate-150/70 cursor-pointer"
            >
              <div className="w-7 h-7 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 font-bold">
                <Calendar size={16} />
              </div>
              <span className="truncate font-semibold">กิจกรรม {mockMorningBrief.events} งาน</span>
            </div>

            <div 
              onClick={() => setActiveTab('market')}
              className="flex items-center gap-2.5 text-slate-700 bg-slate-50/90 hover:bg-slate-100/80 transition-colors p-2.5 rounded-2xl border border-slate-150/70 cursor-pointer"
            >
              <div className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 font-bold">
                <Store size={16} />
              </div>
              <span className="truncate font-semibold">ร้านใหม่ {mockMorningBrief.newShops} ร้าน</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Menus (หมวดหมู่ด่วน) */}
      <div className="px-5 mt-7">
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="font-extrabold text-[15px] text-slate-900 tracking-tight">บริการและเรื่องด่วน</h2>
          <span className="text-[11px] font-bold text-slate-400">แตะเพื่อเปิดบริการ</span>
        </div>

        <div className="flex overflow-x-auto hide-scrollbar gap-3.5 pb-2 -mx-5 px-5">
          {quickMenus.map((menu, idx) => {
            const Icon = menu.icon;
            return (
              <button 
                key={idx} 
                onClick={menu.onClick}
                className="flex flex-col items-center gap-2 shrink-0 group focus:outline-none"
              >
                <div className={`w-[60px] h-[60px] rounded-[22px] flex items-center justify-center ${menu.color} border ${menu.border} shadow-sm group-hover:scale-105 group-active:scale-95 transition-all duration-200 backdrop-blur-sm`}>
                  <Icon size={24} className="transition-transform group-hover:scale-110" />
                </div>
                <span className="text-[12px] font-bold text-slate-700 group-hover:text-emerald-700 transition-colors">
                  {menu.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Local Alerts */}
      <div className="px-5 mt-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-500/15 text-rose-600 flex items-center justify-center font-bold">
              <AlertCircle size={18} />
            </div>
            <div>
              <h2 className="font-extrabold text-[17px] text-slate-900 tracking-tight">
                เหตุการณ์และเตือนภัย
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">รายงานสดโดยคนในพื้นที่และหน่วยงาน</p>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5">
            <button 
              onClick={() => setShowIncidentModal(true)}
              className="bg-rose-600 hover:bg-rose-500 text-white px-3 py-1.5 rounded-full text-[11.5px] font-bold transition-all shadow-sm flex items-center gap-1"
            >
              <PlusCircle size={13} />
              <span>แจ้งเหตุ</span>
            </button>

            <button 
              onClick={() => setAlertFilter(prev => prev === 'all' ? 'flood' : 'all')}
              className={`px-3 py-1.5 rounded-full text-[11.5px] font-bold transition-all border ${
                alertFilter !== 'all' ? 'bg-slate-900 text-white border-slate-900' : 'text-slate-700 bg-white hover:bg-slate-100 border-slate-200'
              }`}
            >
              {alertFilter === 'all' ? `ทั้งหมด (${alerts.length})` : 'กรอง'}
            </button>
          </div>
        </div>
        
        <div className="space-y-4">
          {filteredAlerts.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl text-center border border-slate-200 text-slate-400 text-[13px]">
              ไม่พบรายการเตือนภัยในหมวดหมู่นี้
            </div>
          ) : (
            filteredAlerts.map(alert => (
              <AlertCard 
                key={alert.id} 
                alert={alert} 
                onVote={(type) => voteAlert(alert.id, type)}
                onCameraClick={() => setShowIncidentModal(true)}
              />
            ))
          )}
        </div>
      </div>

      {/* Sub-Modals */}
      {showIncidentModal && <IncidentReportModal onClose={() => setShowIncidentModal(false)} />}
      {showFoodModal && <FoodGuideModal onClose={() => setShowFoodModal(false)} />}
      {showJobsModal && <LocalJobsModal onClose={() => setShowJobsModal(false)} />}
      {showEventsModal && <CommunityEventsModal onClose={() => setShowEventsModal(false)} />}
      {showRealEstateModal && <RealEstateModal onClose={() => setShowRealEstateModal(false)} />}
      {showHelpModal && <EmergencyHelpModal onClose={() => setShowHelpModal(false)} />}
      {showLocationModal && <LocationPickerModal onClose={() => setShowLocationModal(false)} />}
      {showNotificationsModal && <NotificationCenterModal onClose={() => setShowNotificationsModal(false)} />}

    </div>
  );
}

interface AlertCardProps {
  alert: Alert;
  onVote: (type: 'up' | 'down') => void;
  onCameraClick: () => void;
}

const AlertCard: React.FC<AlertCardProps> = ({ 
  alert, 
  onVote, 
  onCameraClick 
}) => {
  const getStatusConfig = (status: Alert['status']) => {
    switch(status) {
      case 'unconfirmed': return { icon: AlertTriangle, color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200/80', text: 'ยังไม่ยืนยัน' };
      case 'members': return { icon: Users, color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200/80', text: 'สมาชิกยืนยันแล้ว' };
      case 'authority': return { icon: ShieldCheck, color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200/80', text: 'หน่วยงานยืนยัน' };
    }
  };

  const statusConfig = getStatusConfig(alert.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="bg-white border border-slate-200/80 rounded-[26px] p-5 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] overflow-hidden relative transition-all hover:shadow-md">
      {/* Type Indicator Line */}
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
        alert.type === 'flood' ? 'bg-sky-500' : 
        alert.type === 'power' ? 'bg-amber-500' : 
        alert.type === 'road' ? 'bg-orange-500' : 'bg-rose-500'
      }`} />
      
      <div className="flex justify-between items-start mb-2.5 pl-1.5">
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold border ${statusConfig.bg} ${statusConfig.color}`}>
          <StatusIcon size={13} />
          {statusConfig.text}
        </div>
        <span className="text-[11.5px] font-bold text-slate-400 flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-md">
          <Clock size={12} />
          {alert.time}
        </span>
      </div>
      
      <div className="pl-1.5">
        <h3 className="font-extrabold text-slate-900 text-[15.5px] mb-1 leading-snug">{alert.title}</h3>
        <p className="text-[13.5px] text-slate-600 mb-3 line-clamp-2 leading-relaxed font-normal">{alert.description}</p>
        
        {alert.image && (
          <div className="mb-3.5 rounded-2xl overflow-hidden max-h-44 border border-slate-150 bg-slate-900">
            <img src={alert.image} alt={alert.title} className="w-full h-44 object-cover hover:scale-105 transition-transform" />
          </div>
        )}

        <div className="flex items-center gap-2 text-[12px] font-bold text-slate-600 mb-4 bg-slate-50 p-2.5 rounded-2xl border border-slate-150/70">
          <div className="w-6 h-6 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm border border-slate-100">
            <MapPin size={13} className="text-emerald-600" />
          </div>
          <span className="truncate">{alert.location.district} • ห่างจากคุณ {alert.location.distance || '0.5'} กม.</span>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => onVote('up')}
            className={`flex-1 py-2.5 rounded-xl text-[12.5px] font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-sm ${
              alert.userVoted === 'up'
                ? 'bg-emerald-600 text-white shadow-emerald-600/20'
                : 'bg-slate-900 hover:bg-slate-800 text-white'
            }`}
          >
            <ThumbsUp size={15} />
            ยืนยัน ({alert.confirmations})
          </button>

          <button 
            onClick={() => onVote('down')}
            className={`flex-1 border py-2.5 rounded-xl text-[12.5px] font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
              alert.userVoted === 'down'
                ? 'bg-rose-50 text-rose-700 border-rose-300'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/80'
            }`}
          >
            <ThumbsDown size={15} />
            ไม่พบ ({alert.rejections || 0})
          </button>

          <button 
            onClick={onCameraClick}
            title="ถ่ายภาพรายงาน"
            className="flex-none w-11 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/80 py-2.5 rounded-xl text-[13px] flex items-center justify-center transition-all active:scale-95"
          >
            <Camera size={17} />
          </button>
        </div>
      </div>
    </div>
  );
}
