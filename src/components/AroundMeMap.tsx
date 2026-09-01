import React, { useState } from 'react';
import { Layers, Filter, Search, MapPin, Compass, Navigation2, Zap } from 'lucide-react';
import { useCommunity } from '../context/CommunityContext';
import { MapFilterModal } from './modals/MapFilterModal';
import { PlaceDetailModal, MapPoint } from './modals/PlaceDetailModal';
import { LocalHubLogo } from './LocalHubLogo';

export function AroundMeMap() {
  const { showToast } = useCommunity();
  const [radius, setRadius] = useState<string>('5km');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showFilterModal, setShowFilterModal] = useState<boolean>(false);
  const [selectedPlace, setSelectedPlace] = useState<MapPoint | null>(null);

  const categories = [
    { id: 'all', label: 'ทั้งหมด' },
    { id: 'incident', label: 'เตือนภัย', color: 'bg-rose-500' },
    { id: 'food', label: 'ร้านอาหาร', color: 'bg-amber-500' },
    { id: 'event', label: 'กิจกรรม', color: 'bg-purple-500' },
    { id: 'shop', label: 'ร้านค้า/บริการ', color: 'bg-emerald-500' },
  ];

  const radiuses = [
    { id: '1km', label: '1 กม.' },
    { id: '5km', label: '5 กม.' },
    { id: '10km', label: '10 กม.' },
    { id: 'district', label: 'ทั้งอำเภอ' },
    { id: 'province', label: 'ทั้งจังหวัด' },
  ];

  const mapPoints: MapPoint[] = [
    {
      id: 'p1',
      name: 'ซ่อมผิวจราจรและท่อระบายน้ำ',
      type: 'incident',
      lat: 13.801,
      lng: 100.56,
      distance: '500 ม.',
      category: 'ปิดถนน/งานก่อสร้าง',
      status: 'กำลังดำเนินการ (เสร็จสิ้น 17:00 น.)',
      description: 'ปิดการจราจรเลนซ้าย ซอยพหลโยธิน 32 โปรดใช้ทางเลี่ยง'
    },
    {
      id: 'p2',
      name: 'ก๋วยเตี๋ยวเรือป้าสมศรี สูตรอยุธยา',
      type: 'food',
      lat: 13.805,
      lng: 100.565,
      distance: '1.2 กม.',
      category: 'ร้านอาหาร',
      rating: 4.8,
      phone: '081-999-8877',
      description: 'ก๋วยเตี๋ยวเรือน้ำตกเข้มข้น แคปหมูกรอบ กากหมูเจียวสดใหม่ทุกวัน'
    },
    {
      id: 'p3',
      name: 'งานประเพณีและตลาดนัดวัดสว่าง',
      type: 'incident', // mapped to event styling
      lat: 13.795,
      lng: 100.555,
      distance: '2.5 กม.',
      category: 'งานวัดและประเพณี',
      status: 'วันนี้ - 22:00 น.',
      description: 'มีร้านค้าชุมชน ชิงช้าสวรรค์ ดนตรีสด และของกินกว่า 50 ร้าน'
    },
    {
      id: 'p4',
      name: 'ร้านช่างเอก ซ่อมมอเตอร์ไซค์/ปะยาง',
      type: 'shop',
      lat: 13.802,
      lng: 100.568,
      distance: '750 ม.',
      category: 'ร้านค้าและบริการ',
      rating: 4.9,
      phone: '089-112-2334',
      description: 'รับซ่อมมอเตอร์ไซค์ เปลี่ยนถ่ายน้ำมันเครื่อง ปะยางด่วน 24 ชม.'
    }
  ];

  const filteredPoints = mapPoints.filter(point => {
    const matchSearch = point.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      point.category.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeCategory === 'all') return matchSearch;
    return matchSearch && (point.type === activeCategory || (activeCategory === 'event' && point.category.includes('งาน')));
  });

  const handleRadiusChange = (radId: string, label: string) => {
    setRadius(radId);
    showToast(`🗺️ ขยายการแสดงผลรอบตัวเป็น: ${label}`);
  };

  return (
    <div className="h-[100dvh] flex flex-col pb-16 bg-slate-100 relative">
      
      {/* Search and Filters Overlay */}
      <div className="absolute top-0 left-0 right-0 pt-8 pb-4 px-4 z-20">
        {/* Brand bar overlay */}
        <div className="flex items-center justify-between mb-3 px-3 py-2 bg-white/90 backdrop-blur-xl rounded-2xl border border-slate-200/80 shadow-md">
          <LocalHubLogo size="sm" variant="dark" showSubtitle={false} />
          <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            เรดาร์รอบตัว
          </span>
        </div>

        <div className="flex gap-2 mb-3">
          <div className="relative flex-1 shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
            <input 
              type="text" 
              placeholder="ค้นหาสถานที่, พิกัด, เหตุการณ์ในย่าน..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/95 backdrop-blur-xl rounded-2xl text-[13.5px] font-medium text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all border border-slate-200/80"
            />
          </div>
          <button 
            onClick={() => setShowFilterModal(true)}
            title="ตัวกรอง"
            className="w-12 h-12 bg-white/95 backdrop-blur-xl rounded-2xl flex items-center justify-center text-slate-700 shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-slate-200/80 hover:bg-slate-50 active:scale-95 transition-all"
          >
            <Filter size={18} />
          </button>
        </div>

        {/* Categories Pills */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
          {categories.map(cat => {
            const isSelected = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-[12px] font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shadow-sm border ${
                  isSelected 
                    ? 'bg-slate-900 text-white border-slate-900 shadow-md' 
                    : 'bg-white/95 backdrop-blur-md border-slate-200/80 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {cat.color && <span className={`w-2 h-2 rounded-full ${cat.color}`} />}
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Map Area */}
      <div className="flex-1 relative bg-gradient-to-b from-slate-100 via-emerald-50/30 to-slate-200/60 overflow-hidden">
        
        {/* Subtle Map Geometry Grid */}
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'radial-gradient(#0f172a 1.5px, transparent 1.5px)', backgroundSize: '24px 24px' }}></div>
        
        {/* Simulated Road Lines */}
        <svg className="absolute inset-0 w-full h-full stroke-slate-300/60 stroke-[4] fill-none opacity-40">
          <path d="M-50 150 Q 150 180 200 350 T 450 500" />
          <path d="M 120 -50 L 180 700" />
          <path d="M 350 -50 L 300 700" />
          <path d="M -50 420 Q 200 400 450 480" />
        </svg>

        {/* Dynamic Map Pins */}
        {filteredPoints.map((pt, idx) => {
          let posStyle = 'top-1/3 left-1/4';
          let icon = '🚧';
          let gradient = 'from-rose-600 to-red-500';
          let shadow = 'shadow-rose-500/30';
          let arrowColor = 'bg-rose-600';

          if (pt.id === 'p2') {
            posStyle = 'top-1/2 right-1/4';
            icon = '🍜';
            gradient = 'from-amber-500 to-orange-500';
            shadow = 'shadow-amber-500/30';
            arrowColor = 'bg-amber-500';
          } else if (pt.id === 'p3') {
            posStyle = 'bottom-1/4 left-1/3';
            icon = '🎪';
            gradient = 'from-purple-600 to-indigo-600';
            shadow = 'shadow-purple-500/30';
            arrowColor = 'bg-purple-600';
          } else if (pt.id === 'p4') {
            posStyle = 'top-1/4 right-1/3';
            icon = '🔧';
            gradient = 'from-emerald-600 to-teal-500';
            shadow = 'shadow-emerald-500/30';
            arrowColor = 'bg-emerald-600';
          }

          return (
            <div 
              key={pt.id} 
              onClick={() => setSelectedPlace(pt)}
              className={`absolute ${posStyle} animate-bounce cursor-pointer group z-10`} 
              style={{ animationDuration: `${2.4 + idx * 0.4}s`, animationDelay: `${idx * 0.2}s` }}
            >
              <div className="relative group">
                <div className={`w-12 h-12 bg-gradient-to-tr ${gradient} rounded-2xl flex items-center justify-center text-white shadow-xl ${shadow} border-2 border-white z-10 relative group-hover:scale-110 transition-transform`}>
                  <span className="text-xl">{icon}</span>
                </div>
                <div className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 ${arrowColor} rotate-45 z-0`}></div>
                <div className="absolute top-full mt-2.5 left-1/2 -translate-x-1/2 w-max bg-slate-950/90 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-xl border border-slate-800 flex items-center gap-1">
                  <span>{pt.name.slice(0, 16)}</span>
                  <span className="text-slate-400">• {pt.distance}</span>
                </div>
              </div>
            </div>
          );
        })}

        {/* User Location Radar Pulse */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="w-32 h-32 bg-emerald-500/10 rounded-full flex items-center justify-center animate-ping" style={{ animationDuration: '3.5s' }}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-emerald-500 rounded-full border-4 border-white shadow-xl flex items-center justify-center">
            <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
          </div>
        </div>

        {/* Radius Selector Floating Dock */}
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-xl p-1.5 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-slate-200/80 flex gap-1 z-10">
          {radiuses.map(rad => (
            <button
              key={rad.id}
              onClick={() => handleRadiusChange(rad.id, rad.label)}
              className={`px-3 py-1.5 rounded-xl text-[11.5px] font-extrabold transition-all active:scale-95 ${
                radius === rad.id 
                  ? 'bg-slate-900 text-white shadow-sm' 
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
              }`}
            >
              {rad.label}
            </button>
          ))}
        </div>

        {/* Floating Action Button */}
        <button 
          onClick={() => setShowFilterModal(true)}
          title="ชั้นข้อมูล"
          className="absolute bottom-36 right-5 w-11 h-11 bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.1)] flex items-center justify-center text-slate-700 hover:bg-slate-50 border border-slate-200/80 transition-all active:scale-95 z-10"
        >
          <Layers size={20} />
        </button>
      </div>

      {/* Modals */}
      {showFilterModal && (
        <MapFilterModal 
          selectedCategory={activeCategory}
          onSelectCategory={(c) => { setActiveCategory(c); setShowFilterModal(false); }}
          onClose={() => setShowFilterModal(false)}
        />
      )}

      {selectedPlace && (
        <PlaceDetailModal 
          place={selectedPlace} 
          onClose={() => setSelectedPlace(null)} 
        />
      )}

    </div>
  );
}
