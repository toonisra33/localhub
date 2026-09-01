import React from 'react';
import { X, MapPin, Navigation, Phone, Star, AlertTriangle, Droplets, Utensils, Heart } from 'lucide-react';
import { useCommunity } from '../../context/CommunityContext';

export interface MapPoint {
  id: string;
  name: string;
  type: 'food' | 'incident' | 'shop' | 'service';
  lat: number;
  lng: number;
  distance: string;
  category: string;
  rating?: number;
  status?: string;
  phone?: string;
  description?: string;
}

interface PlaceDetailModalProps {
  place: MapPoint;
  onClose: () => void;
}

export function PlaceDetailModal({ place, onClose }: PlaceDetailModalProps) {
  const { showToast } = useCommunity();

  const handleNavigate = () => {
    showToast(`📍 กำลังนำทางไปยัง "${place.name}"`);
  };

  return (
    <div className="fixed inset-0 z-[80] bg-slate-950/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-t-[32px] sm:rounded-[32px] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-150 bg-white z-10 shrink-0">
          <div className="flex items-center gap-2">
            <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${
              place.type === 'incident' ? 'bg-rose-50 text-rose-700 border-rose-200' :
              place.type === 'food' ? 'bg-amber-50 text-amber-700 border-amber-200' :
              'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              {place.category}
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-extrabold text-slate-900 text-[17px] leading-snug">
                {place.name}
              </h3>
              <p className="text-[12.5px] font-bold text-emerald-700 flex items-center gap-1 mt-1">
                <MapPin size={13} />
                ห่างจากคุณ {place.distance}
              </p>
            </div>

            {place.rating && (
              <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2 py-1 rounded-xl text-amber-700 font-extrabold text-[12.5px]">
                <Star size={14} className="fill-amber-400 text-amber-400" />
                <span>{place.rating}</span>
              </div>
            )}
          </div>

          {place.description && (
            <p className="text-[13px] text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-150 leading-relaxed font-normal">
              {place.description}
            </p>
          )}

          {place.status && (
            <div className="flex items-center gap-2 text-[12px] font-bold text-slate-700">
              <span className="text-slate-400">สถานะ:</span>
              <span className="bg-slate-100 px-2 py-0.5 rounded-md">{place.status}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2.5 pt-2">
            {place.phone && (
              <a
                href={`tel:${place.phone}`}
                onClick={() => showToast(`📞 กำลังโทรออก: ${place.phone}`)}
                className="flex-1 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[13px] flex items-center justify-center gap-1.5 transition-colors"
              >
                <Phone size={15} />
                โทรสอบถาม
              </a>
            )}

            <button
              onClick={handleNavigate}
              className="flex-1 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-[13px] flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
            >
              <Navigation size={15} className="text-emerald-400" />
              นำทางทันที
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
