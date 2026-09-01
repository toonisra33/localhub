import React from 'react';
import { X, MapPin, Check, Compass, Navigation, Sparkles, Loader2 } from 'lucide-react';
import { useCommunity } from '../../context/CommunityContext';
import { Location } from '../../types';

interface LocationPickerModalProps {
  onClose: () => void;
}

export function LocationPickerModal({ onClose }: LocationPickerModalProps) {
  const { 
    location, 
    setLocation, 
    availableLocations, 
    showToast,
    openLocationPermissionModal,
    isLocatingGps
  } = useCommunity();

  const handleSelect = (loc: Location) => {
    setLocation(loc);
    showToast(`📍 สลับไปยังพื้นที่: ต.${loc.subdistrict}, ${loc.district}`);
    onClose();
  };

  const handleRequestGps = () => {
    onClose();
    openLocationPermissionModal();
  };

  return (
    <div className="fixed inset-0 z-[80] bg-slate-950/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-t-[32px] sm:rounded-[32px] max-h-[85vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 pb-3.5 border-b border-slate-150 bg-white z-10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-sm">
              <Compass size={20} />
            </div>
            <div>
              <h2 className="text-[17px] font-extrabold text-slate-900 leading-tight">เลือกพื้นที่ใช้งาน</h2>
              <p className="text-[11.5px] font-medium text-slate-500">เลือกพื้นที่เพื่อดูข่าวสารและเตือนภัยเฉพาะจุด</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Real Location Access Banner Button */}
        <div className="p-4 pb-1 bg-slate-50/50 shrink-0">
          <button
            onClick={handleRequestGps}
            disabled={isLocatingGps}
            className="w-full p-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 text-white shadow-lg shadow-emerald-600/20 hover:shadow-xl hover:shadow-emerald-600/30 flex items-center justify-between border border-emerald-400/30 group active:scale-[0.98] transition-all"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 shadow-inner group-hover:scale-105 transition-transform">
                {isLocatingGps ? <Loader2 size={20} className="animate-spin" /> : <Navigation size={20} className="animate-pulse" />}
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-[14px] font-extrabold text-white">ใช้พิกัดตำแหน่งจริง (GPS)</span>
                  <span className="px-1.5 py-0.5 rounded-full bg-emerald-400/30 text-[10px] font-extrabold text-emerald-100 border border-emerald-300/30">
                    แนะนำ
                  </span>
                </div>
                <p className="text-[11.5px] text-emerald-100/90 font-medium">
                  {location.isGps 
                    ? `พิกัดปัจจุบัน: ${location.district} (ความแม่นยำ ±${location.accuracy || 10}ม.)` 
                    : 'กดยินยอมให้เข้าถึงตำแหน่ง GPS ของอุปกรณ์'}
                </p>
              </div>
            </div>

            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold shrink-0">
              ➔
            </div>
          </button>
        </div>

        {/* Divider */}
        <div className="px-4 py-2 flex items-center gap-2 text-[11px] font-bold text-slate-400">
          <div className="flex-1 h-px bg-slate-200" />
          <span>หรือเลือกจากพื้นที่ยอดนิยม</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        {/* Location List */}
        <div className="p-4 pt-1 overflow-y-auto space-y-2.5 flex-1 bg-slate-50/50">
          {availableLocations.map((loc, idx) => {
            const isSelected = !location.isGps && loc.subdistrict === location.subdistrict && loc.district === location.district;
            return (
              <button
                key={idx}
                onClick={() => handleSelect(loc)}
                className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  isSelected
                    ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500/20 shadow-sm'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    isSelected ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    <MapPin size={18} />
                  </div>

                  <div>
                    <h3 className="font-extrabold text-slate-900 text-[13.5px]">
                      {loc.district}, {loc.province}
                    </h3>
                    <p className="text-[11.5px] font-medium text-slate-500 mt-0.5">
                      ต.{loc.subdistrict} • {loc.village}
                    </p>
                  </div>
                </div>

                {isSelected && (
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                    <Check size={14} />
                  </div>
                )}
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
}
