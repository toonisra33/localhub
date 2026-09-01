import React, { useState } from 'react';
import { X, Settings, Bell, Shield, Moon, Globe, Trash2, RefreshCw, Radio, UserPlus, LogIn, LogOut, UserCheck } from 'lucide-react';
import { useBroadcast } from '../../context/BroadcastContext';
import { useCommunity } from '../../context/CommunityContext';

interface SettingsModalProps {
  onClose: () => void;
}

export function SettingsModal({ onClose }: SettingsModalProps) {
  const { role, setRole } = useBroadcast();
  const { isLoggedIn, userProfile, openAuthModal, logout, showToast } = useCommunity();
  const [allowNotifications, setAllowNotifications] = useState(true);
  const [emergencyAlertsOnly, setEmergencyAlertsOnly] = useState(false);
  const [radiusKm, setRadiusKm] = useState('5');

  const handleResetDemoData = () => {
    localStorage.clear();
    showToast('รีเซ็ตข้อมูลระบบเรียบร้อย กำลังโหลดหน้าใหม่...', 'info');
    setTimeout(() => {
      window.location.reload();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-[80] bg-slate-950/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-t-[32px] sm:rounded-[32px] max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 pb-3.5 border-b border-slate-150 bg-white z-10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-700 shadow-sm">
              <Settings size={20} />
            </div>
            <div>
              <h2 className="text-[17px] font-extrabold text-slate-900 leading-tight">การตั้งค่าแอปพลิเคชัน</h2>
              <p className="text-[11.5px] font-medium text-slate-500">ปรับแต่งการแจ้งเตือนและการใช้งาน</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Settings Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          
          {/* User Account Section */}
          <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-extrabold text-slate-900 text-[13.5px]">บัญชีผู้ใช้งาน (User Account)</h4>
                <p className="text-[11.5px] text-slate-500">
                  {isLoggedIn ? `เข้าสู่ระบบในชื่อ: ${userProfile.name}` : 'ยังไม่ได้เข้าสู่ระบบ (โหมดผู้เยี่ยมชม)'}
                </p>
              </div>
              <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full ${
                isLoggedIn ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {isLoggedIn ? '✓ เข้าสู่ระบบแล้ว' : 'ผู้เยี่ยมชม'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  openAuthModal('register');
                }}
                className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[12px] font-extrabold shadow-sm flex items-center justify-center gap-1.5 transition-all"
              >
                <UserPlus size={14} />
                ลงทะเบียนใหม่
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  openAuthModal('login');
                }}
                className="py-2.5 px-3 bg-white hover:bg-slate-50 text-slate-800 rounded-xl text-[12px] font-extrabold border border-slate-200 shadow-sm flex items-center justify-center gap-1.5 transition-all"
              >
                <LogIn size={14} />
                เข้าสู่ระบบ / สลับบัญชี
              </button>
            </div>

            {isLoggedIn && (
              <button
                type="button"
                onClick={() => {
                  logout();
                  onClose();
                }}
                className="w-full mt-1.5 py-2 text-rose-600 hover:bg-rose-100/50 rounded-xl text-[11.5px] font-bold transition-all flex items-center justify-center gap-1"
              >
                <LogOut size={13} />
                ออกจากระบบ (Logout)
              </button>
            )}
          </div>

          {/* Role Toggle */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-extrabold text-slate-900 text-[13.5px]">สิทธิ์การใช้งาน (Role)</h4>
                <p className="text-[11.5px] text-slate-500">สำหรับทดสอบฟีเจอร์บรอดแคสส่วนกลาง</p>
              </div>
              <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full ${
                role === 'admin' ? 'bg-red-500 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {role === 'admin' ? '👑 แอดมิน' : '👤 สมาชิก'}
              </span>
            </div>

            <div className="flex p-1 bg-white rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setRole('user');
                  showToast('สลับเป็นโหมด สมาชิกทั่วไป (User)');
                }}
                className={`flex-1 py-1.5 rounded-lg text-[12px] font-bold transition-all ${
                  role === 'user' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                สมาชิกทั่วไป
              </button>
              <button
                type="button"
                onClick={() => {
                  setRole('admin');
                  showToast('สลับเป็นโหมด ผู้ดูแลระบบ (Admin)');
                }}
                className={`flex-1 py-1.5 rounded-lg text-[12px] font-bold transition-all ${
                  role === 'admin' ? 'bg-red-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                ผู้ดูแลระบบ (Admin)
              </button>
            </div>
          </div>

          {/* Notifications config */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
            <h4 className="font-extrabold text-slate-900 text-[13.5px]">การแจ้งเตือนเตือนภัย</h4>

            <div className="flex items-center justify-between">
              <span className="text-[13px] text-slate-700 font-medium">เปิดรับการแจ้งเตือนเสียง/ป๊อปอัป</span>
              <input
                type="checkbox"
                checked={allowNotifications}
                onChange={e => {
                  setAllowNotifications(e.target.checked);
                  showToast(e.target.checked ? 'เปิดการแจ้งเตือนแล้ว' : 'ปิดการแจ้งเตือนแล้ว', 'info');
                }}
                className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[13px] text-slate-700 font-medium">รับเฉพาะเหตุการณ์ฉุกเฉินระดับสูง</span>
              <input
                type="checkbox"
                checked={emergencyAlertsOnly}
                onChange={e => {
                  setEmergencyAlertsOnly(e.target.checked);
                  showToast('บันทึกการตั้งค่าแล้ว');
                }}
                className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Feed Radius */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
            <div className="flex justify-between items-center">
              <h4 className="font-extrabold text-slate-900 text-[13.5px]">รัศมีเนื้อหาเริ่มต้น</h4>
              <span className="text-[12px] font-extrabold text-emerald-600">{radiusKm} กิโลเมตร</span>
            </div>
            <input
              type="range"
              min="1"
              max="20"
              value={radiusKm}
              onChange={e => setRadiusKm(e.target.value)}
              className="w-full accent-emerald-600"
            />
          </div>

          {/* Reset Demo */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleResetDemoData}
              className="w-full py-3 rounded-2xl border border-rose-200 text-rose-600 bg-rose-50/50 hover:bg-rose-50 font-bold text-[13px] flex items-center justify-center gap-2 transition-colors"
            >
              <RefreshCw size={15} />
              ล้างแคชและรีเซ็ตข้อมูลทดสอบ (Reset Demo Data)
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
