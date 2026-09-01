import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  APIProvider, 
  Map, 
  AdvancedMarker, 
  Pin, 
  useMap,
  MapCameraChangedEvent
} from '@vis.gl/react-google-maps';
import { 
  Layers, 
  Filter, 
  Search, 
  MapPin, 
  Compass, 
  Navigation, 
  Navigation2, 
  Plus, 
  Crosshair, 
  Star, 
  AlertTriangle, 
  Utensils, 
  Store, 
  Calendar, 
  Radio, 
  Eye, 
  EyeOff, 
  Car, 
  Check, 
  X,
  RefreshCw,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { useCommunity } from '../context/CommunityContext';
import { MapFilterModal } from './modals/MapFilterModal';
import { PlaceDetailModal, MapPoint } from './modals/PlaceDetailModal';
import { AddCustomPinModal } from './modals/AddCustomPinModal';
import { LocalHubLogo } from './LocalHubLogo';

// Helper function to calculate geodesic distance in km/meters
function calculateDistanceStr(lat1: number, lon1: number, lat2: number, lon2: number): string {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  if (d < 1) {
    return `${Math.round(d * 1000)} ม.`;
  }
  return `${d.toFixed(1)} กม.`;
}

// Controller component inside Map to handle smooth programmatic camera movement & traffic layers
function MapCameraHandler({ 
  center, 
  zoom, 
  showTraffic 
}: { 
  center: { lat: number; lng: number }; 
  zoom: number;
  showTraffic: boolean;
}) {
  const map = useMap();
  const [trafficLayer, setTrafficLayer] = useState<google.maps.TrafficLayer | null>(null);

  useEffect(() => {
    if (!map) return;
    map.panTo(center);
  }, [map, center.lat, center.lng]);

  useEffect(() => {
    if (!map) return;
    map.setZoom(zoom);
  }, [map, zoom]);

  useEffect(() => {
    if (!map) return;
    if (showTraffic) {
      if (!trafficLayer && window.google?.maps?.TrafficLayer) {
        const layer = new google.maps.TrafficLayer();
        layer.setMap(map);
        setTrafficLayer(layer);
      } else if (trafficLayer) {
        trafficLayer.setMap(map);
      }
    } else {
      if (trafficLayer) {
        trafficLayer.setMap(null);
      }
    }
  }, [map, showTraffic]);

  return null;
}

const STORAGE_CUSTOM_PINS_KEY = 'localhub_custom_map_pins';

const INITIAL_REAL_PLACES: MapPoint[] = [
  {
    id: 'p1',
    name: '🚧 ซ่อมผิวจราจรและท่อระบายน้ำ ซ.พหลโยธิน 32',
    type: 'incident',
    lat: 13.8324,
    lng: 100.5752,
    distance: '500 ม.',
    category: 'ปิดถนน/งานก่อสร้าง',
    status: 'กำลังดำเนินการ (เสร็จสิ้น 17:00 น.)',
    description: 'ปิดการจราจรเลนซ้าย ซอยพหลโยธิน 32 ช่วงเสนานิคม โปรดใช้ทางเลี่ยง'
  },
  {
    id: 'p2',
    name: '🍜 ก๋วยเตี๋ยวเรือป้าสมศรี สูตรอยุธยาแท้',
    type: 'food',
    lat: 13.8295,
    lng: 100.5698,
    distance: '1.2 กม.',
    category: 'ร้านอาหาร',
    rating: 4.8,
    phone: '081-999-8877',
    description: 'ก๋วยเตี๋ยวเรือน้ำตกเข้มข้น แคปหมูกรอบ กากหมูเจียวสดใหม่ทุกวัน เปิด 09:00 - 16:30 น.'
  },
  {
    id: 'p3',
    name: '🎪 งานประเพณีและตลาดนัดวัดเสมียนนารี',
    type: 'event',
    lat: 13.8398,
    lng: 100.5521,
    distance: '2.1 กม.',
    category: 'งานวัดและประเพณี',
    status: 'วันนี้ - 22:00 น.',
    description: 'มีร้านค้าชุมชน ชิงช้าสวรรค์ ดนตรีสด และของกินพื้นบ้านกว่า 50 ร้าน'
  },
  {
    id: 'p4',
    name: '🔧 ร้านช่างเอก ซ่อมมอเตอร์ไซค์ & ปะยางด่วน 24 ชม.',
    type: 'shop',
    lat: 13.8262,
    lng: 100.5724,
    distance: '750 ม.',
    category: 'ร้านค้าและบริการ',
    rating: 4.9,
    phone: '089-112-2334',
    description: 'รับซ่อมมอเตอร์ไซค์ทุกยี่ห้อ เปลี่ยนถ่ายน้ำมันเครื่อง ปะยางนอกสถานที่'
  },
  {
    id: 'p5',
    name: '☕ Slow Bar Coffee & Community Space อารีย์',
    type: 'food',
    lat: 13.7801,
    lng: 100.5442,
    distance: '3.4 กม.',
    category: 'ร้านอาหาร/คาเฟ่',
    rating: 4.9,
    phone: '082-345-6789',
    description: 'กาแฟ Specialty คั่วสด มีเมล็ด Single Origin บรรยากาศเงียบสงบ เหมาะสำหรับนั่งทำงาน'
  },
  {
    id: 'p6',
    name: '🌳 สวนจตุจักร & ตลาดนัดสุดสัปดาห์',
    type: 'event',
    lat: 13.8032,
    lng: 100.5539,
    distance: '1.8 กม.',
    category: 'สถานที่พักผ่อน/ตลาดนัด',
    status: 'เปิด 05:00 - 21:00 น.',
    description: 'พื้นที่สีเขียวใจกลางเมือง ออกกำลังกาย วิ่ง ปั่นจักรยาน และจับจ่ายซื้อของ'
  }
];

export function AroundMeMap() {
  const { 
    showToast, 
    openLocationPermissionModal, 
    location, 
    isLocatingGps,
    requestRealLocation 
  } = useCommunity();

  const apiKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) || '';

  // Center coordinate state (default: Bangkok / User location)
  const defaultCenter = useMemo(() => ({
    lat: location.latitude || 13.8305,
    lng: location.longitude || 100.5695
  }), [location.latitude, location.longitude]);

  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>(defaultCenter);
  const [mapZoom, setMapZoom] = useState<number>(14);
  const [mapTypeId, setMapTypeId] = useState<google.maps.MapTypeId | 'roadmap' | 'satellite' | 'hybrid' | 'terrain'>('roadmap');
  const [showTraffic, setShowTraffic] = useState<boolean>(false);

  // Filter and Search states
  const [radius, setRadius] = useState<string>('5km');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showFilterModal, setShowFilterModal] = useState<boolean>(false);
  const [showLayersModal, setShowLayersModal] = useState<boolean>(false);

  // Pinning & Selection states
  const [selectedPlace, setSelectedPlace] = useState<MapPoint | null>(null);
  const [isPinningMode, setIsPinningMode] = useState<boolean>(false);
  const [pendingPinCoords, setPendingPinCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [showAddPinModal, setShowAddPinModal] = useState<boolean>(false);

  // Custom Pinned places stored in localStorage
  const [customPins, setCustomPins] = useState<MapPoint[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CUSTOM_PINS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Sync custom pins to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_CUSTOM_PINS_KEY, JSON.stringify(customPins));
    } catch (e) {
      console.error('Failed to save pins to localStorage', e);
    }
  }, [customPins]);

  // Combine default places with custom pins and update real-time geodesic distance
  const allMapPoints = useMemo(() => {
    const combined = [...INITIAL_REAL_PLACES, ...customPins];
    const userLat = location.latitude || mapCenter.lat;
    const userLng = location.longitude || mapCenter.lng;

    return combined.map(pt => ({
      ...pt,
      distance: calculateDistanceStr(userLat, userLng, pt.lat, pt.lng)
    }));
  }, [customPins, location.latitude, location.longitude, mapCenter.lat, mapCenter.lng]);

  const categories = [
    { id: 'all', label: 'ทั้งหมด', icon: '🌐' },
    { id: 'custom', label: '📌 หมุดของฉัน', count: customPins.length, color: 'bg-indigo-500' },
    { id: 'incident', label: '🚨 เตือนภัย/ซ่อมบำรุง', color: 'bg-rose-500' },
    { id: 'food', label: '🍜 ร้านอาหาร/คาเฟ่', color: 'bg-amber-500' },
    { id: 'event', label: '🎪 กิจกรรม/งานวัด', color: 'bg-purple-500' },
    { id: 'shop', label: '🛒 ร้านค้า/บริการ', color: 'bg-emerald-500' },
  ];

  const radiuses = [
    { id: '1km', label: '1 กม.' },
    { id: '5km', label: '5 กม.' },
    { id: '10km', label: '10 กม.' },
    { id: 'district', label: 'ทั้งอำเภอ/เขต' },
    { id: 'province', label: 'ทั้งจังหวัด' },
  ];

  const landmarkPresets = [
    { name: '📍 ชุมชนพหลโยธิน - บางซื่อ', lat: 13.8305, lng: 100.5695 },
    { name: '📍 สยาม - ปทุมวัน', lat: 13.7462, lng: 100.5348 },
    { name: '📍 อารีย์ - พญาไท', lat: 13.7801, lng: 100.5442 },
    { name: '📍 จตุจักร - ลาดพร้าว', lat: 13.8032, lng: 100.5539 },
    { name: '📍 สุขุมวิท - อโศก', lat: 13.7372, lng: 100.5604 },
    { name: '📍 เชียงใหม่ (นิมมาน)', lat: 18.7961, lng: 98.9686 },
    { name: '📍 ภูเก็ต (เมืองเก่า)', lat: 7.8841, lng: 98.3904 },
  ];

  // Filter map points
  const filteredPoints = useMemo(() => {
    return allMapPoints.filter(point => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q || 
        point.name.toLowerCase().includes(q) ||
        point.category.toLowerCase().includes(q) ||
        (point.description && point.description.toLowerCase().includes(q));

      if (!matchSearch) return false;

      if (activeCategory === 'all') return true;
      if (activeCategory === 'custom') return point.isCustomPin === true;
      if (activeCategory === 'event') return point.type === 'event' || point.category.includes('งาน') || point.category.includes('กิจกรรม');
      return point.type === activeCategory;
    });
  }, [allMapPoints, searchQuery, activeCategory]);

  // Handle map click
  const handleMapClick = (e: any) => {
    if (e.detail?.latLng) {
      const clickedLat = e.detail.latLng.lat;
      const clickedLng = e.detail.latLng.lng;
      setPendingPinCoords({ lat: clickedLat, lng: clickedLng });
      setShowAddPinModal(true);
      setIsPinningMode(false);
      showToast(`📍 เลือกพิกัด: ${clickedLat.toFixed(4)}, ${clickedLng.toFixed(4)}`);
    }
  };

  // Add new pin
  const handleSaveNewPin = (newPinData: Omit<MapPoint, 'id' | 'distance'>) => {
    const newPin: MapPoint = {
      ...newPinData,
      id: `custom_pin_${Date.now()}`,
      distance: calculateDistanceStr(
        location.latitude || mapCenter.lat, 
        location.longitude || mapCenter.lng, 
        newPinData.lat, 
        newPinData.lng
      )
    };

    setCustomPins(prev => [newPin, ...prev]);
    setSelectedPlace(newPin);
    setMapCenter({ lat: newPin.lat, lng: newPin.lng });
    showToast(`✅ ปักหมุด "${newPin.name}" ลงใน Google Map เรียบร้อยแล้ว!`);
  };

  // Delete pin
  const handleDeletePin = (pinId: string) => {
    setCustomPins(prev => prev.filter(p => p.id !== pinId));
    if (selectedPlace?.id === pinId) {
      setSelectedPlace(null);
    }
  };

  // Jump to landmark
  const handleJumpToLandmark = (preset: typeof landmarkPresets[0]) => {
    setMapCenter({ lat: preset.lat, lng: preset.lng });
    setMapZoom(15);
    showToast(`🗺️ เลื่อนแผนที่ไปยัง: ${preset.name}`);
  };

  // Locate user GPS
  const handleGpsCenter = async () => {
    const success = await requestRealLocation();
    if (success && location.latitude && location.longitude) {
      setMapCenter({ lat: location.latitude, lng: location.longitude });
      setMapZoom(16);
      showToast('🎯 ปักหมุดที่พิกัด GPS ปัจจุบันของคุณแล้ว');
    } else {
      openLocationPermissionModal();
    }
  };

  // Start pinning at center
  const handleStartPinningAtCenter = () => {
    setPendingPinCoords({ lat: mapCenter.lat, lng: mapCenter.lng });
    setShowAddPinModal(true);
  };

  return (
    <div className="h-[100dvh] flex flex-col pb-16 bg-slate-900 relative select-none">
      
      {/* Top Search & Filter Bar Overlay */}
      <div className="absolute top-0 left-0 right-0 pt-7 pb-3 px-3.5 z-20 pointer-events-none">
        <div className="pointer-events-auto space-y-2">
          
          {/* Brand header pill */}
          <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/70 shadow-lg">
            <LocalHubLogo size="sm" variant="dark" showSubtitle={false} />
            
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-extrabold text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Google Maps สด
              </span>
              
              <button
                onClick={() => setShowLayersModal(true)}
                title="เปลี่ยนมุมมองแผนที่"
                className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 text-[11px] font-extrabold flex items-center gap-1 transition-all"
              >
                <Layers size={13} />
                <span className="capitalize">
                  {mapTypeId === 'hybrid' ? 'ดาวเทียม+ถนน' : mapTypeId === 'satellite' ? 'ดาวเทียม' : mapTypeId === 'terrain' ? 'ภูมิประเทศ' : 'แผนที่'}
                </span>
              </button>
            </div>
          </div>

          {/* Search Box + Actions */}
          <div className="flex gap-2">
            <div className="relative flex-1 shadow-[0_8px_30px_rgba(0,0,0,0.25)]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="ค้นหาสถานที่, ร้านอาหาร, จุดเตือนภัย, พิกัด..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 bg-white/95 backdrop-blur-xl rounded-2xl text-[13px] font-medium text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 transition-all border border-slate-200 shadow-md"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Pin Location Button */}
            <button 
              onClick={() => {
                setIsPinningMode(!isPinningMode);
                showToast(isPinningMode ? 'ปิดโหมดปักหมุด' : '📍 แตะที่ใดก็ได้บนแผนที่ หรือกดปุ่มปักหมุดเพื่อเพิ่มสถานที่');
              }}
              title="ปักหมุดสถานที่ใหม่"
              className={`px-3 py-2.5 rounded-2xl flex items-center justify-center gap-1.5 shadow-lg border transition-all active:scale-95 text-[12px] font-extrabold ${
                isPinningMode
                  ? 'bg-emerald-600 text-white border-emerald-400 shadow-emerald-500/30 animate-pulse'
                  : 'bg-slate-900/90 text-white hover:bg-slate-800 border-slate-700 backdrop-blur-xl'
              }`}
            >
              <Plus size={16} className={isPinningMode ? 'rotate-45 transition-transform' : ''} />
              <span>{isPinningMode ? 'แตะบนแผนที่' : 'ปักหมุด'}</span>
            </button>

            {/* Filter Modal Button */}
            <button 
              onClick={() => setShowFilterModal(true)}
              title="ตัวกรอง"
              className="w-11 h-11 bg-white/95 backdrop-blur-xl rounded-2xl flex items-center justify-center text-slate-700 shadow-md border border-slate-200 hover:bg-slate-50 active:scale-95 transition-all shrink-0"
            >
              <Filter size={17} />
            </button>
          </div>

          {/* Categories Horizontal Scrolling Pills */}
          <div className="flex gap-1.5 overflow-x-auto hide-scrollbar pb-1">
            {categories.map(cat => {
              const isSelected = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3 py-1 rounded-full text-[11.5px] font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shadow-md border ${
                    isSelected 
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-600/30' 
                      : 'bg-slate-900/85 backdrop-blur-md border-slate-700 text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {cat.color && <span className={`w-2 h-2 rounded-full ${cat.color}`} />}
                  <span>{cat.label}</span>
                  {cat.count !== undefined && (
                    <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full">
                      {cat.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Landmark Presets Pills */}
          <div className="flex gap-1.5 overflow-x-auto hide-scrollbar">
            {landmarkPresets.map((lm, idx) => (
              <button
                key={idx}
                onClick={() => handleJumpToLandmark(lm)}
                className="px-2.5 py-0.5 rounded-lg bg-slate-900/75 hover:bg-slate-800 text-[10.5px] font-semibold text-slate-300 border border-slate-700/60 whitespace-nowrap backdrop-blur-sm transition-all"
              >
                {lm.name}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* Pinning Mode Active Banner */}
      {isPinningMode && (
        <div className="absolute top-44 left-1/2 -translate-x-1/2 z-30 bg-emerald-600 text-white px-4 py-2 rounded-2xl shadow-2xl border border-emerald-400 flex items-center gap-2 text-[12px] font-extrabold animate-bounce">
          <MapPin size={16} />
          <span>แตะจุดใดก็ได้บนแผนที่เพื่อปักหมุด หรือ</span>
          <button 
            onClick={handleStartPinningAtCenter}
            className="bg-white text-emerald-900 px-2 py-0.5 rounded-lg hover:bg-emerald-50 active:scale-95"
          >
            ปักตรงนี้
          </button>
          <button onClick={() => setIsPinningMode(false)} className="p-0.5 hover:bg-emerald-700 rounded-full">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Main Map Container */}
      <div className="w-full h-full relative overflow-hidden bg-slate-950">
        <APIProvider apiKey={apiKey}>
          <Map
            mapId="DEMO_MAP_ID"
            defaultCenter={defaultCenter}
            defaultZoom={mapZoom}
            mapTypeId={mapTypeId}
            gestureHandling="greedy"
            disableDefaultUI={false}
            onClick={handleMapClick}
            className="w-full h-full"
            style={{ width: '100%', height: '100%' }}
            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          >
            {/* Dynamic Camera & Traffic Sync Controller */}
            <MapCameraHandler 
              center={mapCenter} 
              zoom={mapZoom} 
              showTraffic={showTraffic} 
            />

            {/* User GPS Location Marker */}
            {location.latitude && location.longitude && (
              <AdvancedMarker
                position={{ lat: location.latitude, lng: location.longitude }}
                title="พิกัดของคุณ (GPS)"
                zIndex={100}
              >
                <div className="relative flex items-center justify-center">
                  <div className="w-9 h-9 rounded-full bg-emerald-500/25 animate-ping absolute" />
                  <div className="w-6 h-6 rounded-full bg-emerald-500 border-2 border-white shadow-lg flex items-center justify-center text-white text-[9px] font-bold z-10">
                    📍
                  </div>
                </div>
              </AdvancedMarker>
            )}

            {/* Interactive Points on Google Maps */}
            {filteredPoints.map((pt) => {
              const isSelected = selectedPlace?.id === pt.id;
              let pinBg = '#10b981';
              let pinBorder = '#047857';
              let glyphText = '📌';

              if (pt.type === 'incident') {
                pinBg = '#f43f5e';
                pinBorder = '#be123c';
                glyphText = '🚧';
              } else if (pt.type === 'food') {
                pinBg = '#f59e0b';
                pinBorder = '#b45309';
                glyphText = '🍜';
              } else if (pt.type === 'event') {
                pinBg = '#a855f7';
                pinBorder = '#7e22ce';
                glyphText = '🎪';
              } else if (pt.type === 'shop') {
                pinBg = '#06b6d4';
                pinBorder = '#0e7490';
                glyphText = '🛒';
              } else if (pt.isCustomPin) {
                pinBg = '#6366f1';
                pinBorder = '#4338ca';
                glyphText = '📍';
              }

              return (
                <AdvancedMarker
                  key={pt.id}
                  position={{ lat: pt.lat, lng: pt.lng }}
                  onClick={() => setSelectedPlace(pt)}
                  title={pt.name}
                  zIndex={isSelected ? 50 : 10}
                >
                  <div className="group cursor-pointer flex flex-col items-center">
                    <Pin
                      background={pinBg}
                      borderColor={pinBorder}
                      glyphColor="#ffffff"
                      scale={isSelected ? 1.3 : 1.1}
                    >
                      <span className="text-[12px]">{glyphText}</span>
                    </Pin>

                    {/* Small title tag below pin */}
                    <div className="mt-1 px-2 py-0.5 bg-slate-900/90 text-white text-[10px] font-extrabold rounded-lg shadow-md border border-slate-700/80 whitespace-nowrap max-w-[130px] truncate group-hover:max-w-none group-hover:scale-105 transition-all">
                      {pt.name}
                    </div>
                  </div>
                </AdvancedMarker>
              );
            })}

          </Map>
        </APIProvider>

        {/* Center Crosshair Marker when in Pinning Mode */}
        {isPinningMode && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30 flex flex-col items-center">
            <div className="w-10 h-10 border-2 border-emerald-400 border-dashed rounded-full flex items-center justify-center animate-pulse">
              <Crosshair size={22} className="text-emerald-400" />
            </div>
            <span className="mt-1 bg-slate-900/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-700 shadow-lg">
              เลื่อนแผนที่ให้อยู่ตรงกลางจุดที่ต้องการ
            </span>
          </div>
        )}

        {/* Radius Selector Floating Dock at Bottom */}
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-xl p-1 rounded-2xl shadow-2xl border border-slate-700/80 flex gap-1 z-10">
          {radiuses.map(rad => (
            <button
              key={rad.id}
              onClick={() => {
                setRadius(rad.id);
                showToast(`🗺️ กรองรัศมีรอบตัว: ${rad.label}`);
              }}
              className={`px-2.5 py-1.5 rounded-xl text-[11px] font-extrabold transition-all active:scale-95 ${
                radius === rad.id 
                  ? 'bg-emerald-600 text-white shadow-md' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              {rad.label}
            </button>
          ))}
        </div>

        {/* Floating Action Quick Controls (Right Side) */}
        <div className="absolute bottom-36 right-4 flex flex-col gap-2 z-10">
          
          {/* Quick Pin at center */}
          <button 
            onClick={handleStartPinningAtCenter}
            title="ปักหมุดสถานที่ ณ ตำแหน่งนี้"
            className="w-11 h-11 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl shadow-xl flex items-center justify-center border border-emerald-400 transition-all active:scale-95 group relative"
          >
            <Plus size={20} />
            <span className="absolute right-full mr-2 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
              ปักหมุดสถานที่
            </span>
          </button>

          {/* Traffic Toggle */}
          <button 
            onClick={() => {
              setShowTraffic(!showTraffic);
              showToast(showTraffic ? 'ปิดชั้นข้อมูลการจราจร' : '🚦 เปิดแสดงสภาพการจราจรสด');
            }}
            title="สภาพการจราจร"
            className={`w-11 h-11 rounded-2xl shadow-xl flex items-center justify-center border transition-all active:scale-95 ${
              showTraffic
                ? 'bg-amber-500 text-white border-amber-300 ring-2 ring-amber-400/30'
                : 'bg-slate-900/90 text-slate-200 hover:bg-slate-800 border-slate-700 backdrop-blur-xl'
            }`}
          >
            <Car size={18} />
          </button>

          {/* GPS Location Centering */}
          <button 
            onClick={handleGpsCenter}
            title="ระบุตำแหน่ง GPS ปัจจุบัน"
            className={`w-11 h-11 backdrop-blur-xl rounded-2xl shadow-xl flex items-center justify-center border transition-all active:scale-95 ${
              location.isGps
                ? 'bg-emerald-600 text-white border-emerald-400 ring-2 ring-emerald-500/30'
                : 'bg-slate-900/90 text-slate-200 hover:bg-slate-800 border-slate-700'
            }`}
          >
            <Navigation size={18} className={isLocatingGps ? 'animate-spin' : (location.isGps ? 'text-white' : 'text-emerald-400')} />
          </button>

          {/* Layers Switcher */}
          <button 
            onClick={() => setShowLayersModal(true)}
            title="เปลี่ยนมุมมองแผนที่"
            className="w-11 h-11 bg-slate-900/90 hover:bg-slate-800 text-slate-200 backdrop-blur-xl rounded-2xl shadow-xl flex items-center justify-center border border-slate-700 transition-all active:scale-95"
          >
            <Layers size={18} />
          </button>
        </div>

      </div>

      {/* Layers & Map Types Switcher Modal */}
      {showLayersModal && (
        <div className="fixed inset-0 z-[80] bg-slate-950/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 w-full max-w-sm rounded-t-[32px] sm:rounded-[32px] overflow-hidden border border-slate-700 shadow-2xl p-5 text-white space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="font-extrabold text-[15px] flex items-center gap-2">
                <Layers size={16} className="text-emerald-400" />
                <span>ประเภทแผนที่ Google Maps</span>
              </h4>
              <button onClick={() => setShowLayersModal(false)} className="p-1 rounded-full bg-slate-800 text-slate-400 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {[
                { id: 'roadmap', label: 'แผนที่มาตรฐาน', desc: 'ถนนและชื่อสถานที่ชัดเจน', icon: '🗺️' },
                { id: 'satellite', label: 'ภาพถ่ายดาวเทียม', desc: 'ภาพถ่ายจากอวกาศจริง', icon: '🛰️' },
                { id: 'hybrid', label: 'ดาวเทียม + ถนน', desc: 'ภาพถ่ายพร้อมป้ายชื่อทาง', icon: '🌐' },
                { id: 'terrain', label: 'ภูมิประเทศ', desc: 'แสดงความสูงต่ำและระดับดิน', icon: '⛰️' },
              ].map(m => (
                <button
                  key={m.id}
                  onClick={() => {
                    setMapTypeId(m.id as any);
                    setShowLayersModal(false);
                    showToast(`เปลี่ยนมุมมองแผนที่เป็น: ${m.label}`);
                  }}
                  className={`p-3 rounded-2xl border text-left flex flex-col gap-1 transition-all ${
                    mapTypeId === m.id
                      ? 'bg-emerald-600/20 border-emerald-500 ring-2 ring-emerald-500/30'
                      : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700'
                  }`}
                >
                  <span className="text-xl">{m.icon}</span>
                  <span className="font-extrabold text-[12.5px] text-white">{m.label}</span>
                  <span className="text-[10px] text-slate-400 leading-tight">{m.desc}</span>
                </button>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Car size={16} className={showTraffic ? 'text-amber-400' : 'text-slate-500'} />
                <span className="text-[12px] font-bold">แสดงสภาพการจราจรสด (Traffic)</span>
              </div>
              <button
                onClick={() => setShowTraffic(!showTraffic)}
                className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${showTraffic ? 'bg-amber-500' : 'bg-slate-700'}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${showTraffic ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>
        </div>
      )}

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
          onDeletePin={handleDeletePin}
        />
      )}

      {showAddPinModal && (
        <AddCustomPinModal
          initialLat={pendingPinCoords?.lat || mapCenter.lat}
          initialLng={pendingPinCoords?.lng || mapCenter.lng}
          onSavePin={handleSaveNewPin}
          onClose={() => {
            setShowAddPinModal(false);
            setPendingPinCoords(null);
          }}
        />
      )}

    </div>
  );
}
