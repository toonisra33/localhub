import React, { useState } from 'react';
import { X, ShieldCheck, CheckCircle2, Camera, Upload, AlertCircle, Sparkles } from 'lucide-react';
import { useCommunity } from '../../context/CommunityContext';

interface IdVerificationModalProps {
  onClose: () => void;
}

export function IdVerificationModal({ onClose }: IdVerificationModalProps) {
  const { verifyUserAccount, showToast } = useCommunity();
  const [step, setStep] = useState<1 | 2>(1);
  const [isVerifying, setIsVerifying] = useState(false);
  const [idCardNumber, setIdCardNumber] = useState('1100400892xxx');

  const handleVerify = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setStep(2);
      verifyUserAccount();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[80] bg-slate-950/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-t-[32px] sm:rounded-[32px] max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 pb-3.5 border-b border-slate-150 bg-white z-10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-sm">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h2 className="text-[17px] font-extrabold text-slate-900 leading-tight">ยืนยันตัวตนชุมชน</h2>
              <p className="text-[11.5px] font-medium text-slate-500">สร้างความน่าเชื่อถือในการซื้อขายและรายงานเหตุ</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {step === 1 ? (
            <div className="space-y-4">
              <div className="bg-emerald-50/80 border border-emerald-200/80 p-4 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-[14px]">
                  <Sparkles size={16} />
                  <span>สิทธิประโยชน์ของสมาชิกยืนยันแล้ว</span>
                </div>
                <ul className="text-[12px] text-emerald-700 space-y-1.5 list-disc list-inside font-medium">
                  <li>ได้รับตราสัญลักษณ์ <span className="font-bold">"สมาชิกที่ยืนยันแล้ว"</span> สีเขียว</li>
                  <li>เพิ่มคะแนนความน่าเชื่อถือ (Reputation Score) ทันที</li>
                  <li>โพสต์เตือนภัยจะได้รับการพิจารณาขึ้นสถานะความถูกต้องเร็วขึ้น</li>
                  <li>ผู้ซื้อในตลาดชุมชนมีความมั่นใจในการทำธุรกรรมสูงขึ้น</li>
                </ul>
              </div>

              <div>
                <label className="block text-[12px] font-bold text-slate-700 mb-1.5">หมายเลขบัตรประชาชน (4 ตัวท้าย)</label>
                <input
                  type="text"
                  value={idCardNumber}
                  onChange={e => setIdCardNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 rounded-2xl border border-slate-200 text-[13.5px] font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block text-[12px] font-bold text-slate-700 mb-1.5">ภาพถ่ายคู่กับบัตรประชาชน (จำลอง)</label>
                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center bg-slate-50 hover:bg-emerald-50/40 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2">
                    <Camera size={22} />
                  </div>
                  <span className="text-[12.5px] font-bold text-slate-700">ถ่ายรูปเอกสารยืนยันตัวตน</span>
                  <span className="text-[11px] text-slate-400 mt-0.5">ระบบจะตรวจสอบความถูกต้องอัตโนมัติ</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleVerify}
                disabled={isVerifying}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[14px] rounded-2xl shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
              >
                {isVerifying ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>กำลังตรวจสอบเอกสาร...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck size={18} />
                    <span>ส่งคำขอยืนยันตัวตน</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto ring-8 ring-emerald-50 animate-bounce">
                <CheckCircle2 size={36} />
              </div>

              <div>
                <h3 className="text-[18px] font-extrabold text-slate-900">ยืนยันตัวตนสำเร็จแล้ว!</h3>
                <p className="text-[12.5px] text-slate-500 font-medium mt-1">
                  โปรไฟล์ของคุณได้รับเครื่องหมายยืนยันตัวตนสีเขียวเรียบร้อยแล้ว
                </p>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-colors text-[13.5px]"
              >
                เสร็จสิ้น
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
