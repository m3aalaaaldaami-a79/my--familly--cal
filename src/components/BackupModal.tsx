import { useEffect, useId, useRef, useState } from 'react';
import { Download, RotateCcw, Upload, X } from 'lucide-react';
import type { FamilyMember } from '../types/family';
import { parseImportedContacts } from '../utils/contacts';

interface BackupModalProps {
  isOpen: boolean;
  members: FamilyMember[];
  onClose: () => void;
  onImportMembers: (members: FamilyMember[]) => void;
  onRestoreDefaults: () => void;
}

export function BackupModal({
  isOpen,
  members,
  onClose,
  onImportMembers,
  onRestoreDefaults,
}: BackupModalProps) {
  const titleId = useId();
  const fileInputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setStatus(null);
      setConfirmReset(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleExport = () => {
    const payload = {
      app: 'عائلتي',
      exportedAt: new Date().toISOString(),
      members,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `family-contacts-backup.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setStatus({
      type: 'success',
      text: `تم تصدير ${members.length} جهة اتصال عائلية بنجاح.`,
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = parseImportedContacts(text);
      if (!parsed.ok || !parsed.members) {
        setStatus({
          type: 'error',
          text: parsed.error ?? 'تعذر استيراد النسخة الاحتياطية.',
        });
      } else {
        onImportMembers(parsed.members);
        setStatus({
          type: 'success',
          text: `تمت استعادة ${parsed.members.length} فرد من النسخة الاحتياطية بنجاح.`,
        });
      }
    } catch {
      setStatus({
        type: 'error',
        text: 'حدث خطأ أثناء قراءة الملف.',
      });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-4">
          <h2
            id={titleId}
            className="font-display text-xl font-bold text-slate-900"
          >
            النسخ الاحتياطي والاستعادة
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق نافذة النسخ الاحتياطي"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-600 leading-relaxed">
            تُحفظ أرقام وصور عائلتك محلياً على جهازك للوصول الفوري. يمكنك حفظ
            نسخة احتياطية لنقلها إلى هاتف آخر في أي وقت.
          </p>

          <button
            type="button"
            onClick={handleExport}
            disabled={members.length === 0}
            className="w-full min-h-[48px] flex items-center justify-center gap-2 rounded-xl bg-[#0F5C4D] hover:bg-[#0B473B] disabled:opacity-50 text-white font-semibold text-sm transition-colors"
          >
            <Download className="w-4 h-4" aria-hidden="true" />
            <span>حفظ نسخة احتياطية ({members.length} فرد)</span>
          </button>

          <div>
            <input
              ref={fileInputRef}
              id={fileInputId}
              type="file"
              accept="application/json,.json"
              onChange={handleFileChange}
              className="sr-only"
            />
            <label
              htmlFor={fileInputId}
              className="w-full min-h-[48px] flex items-center justify-center gap-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-sm cursor-pointer transition-colors"
            >
              <Upload className="w-4 h-4" aria-hidden="true" />
              <span>استعادة من ملف نسخة احتياطية</span>
            </label>
          </div>

          <div className="pt-3 border-t border-slate-100">
            {!confirmReset ? (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="w-full min-h-[44px] flex items-center justify-center gap-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-xs font-medium transition-colors"
              >
                <RotateCcw className="w-4 h-4" aria-hidden="true" />
                <span>إعادة عرض الأمثلة الافتراضية للعائلة</span>
              </button>
            ) : (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 space-y-2.5">
                <p className="text-xs font-medium text-amber-900">
                  سيتم استبدال القائمة الحالية بجهات الاتصال التجريبية
                  الافتراضية. هل أنت متأكد؟
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onRestoreDefaults();
                      setConfirmReset(false);
                      setStatus({
                        type: 'success',
                        text: 'تمت استعادة الأمثلة الافتراضية بنجاح.',
                      });
                    }}
                    className="min-h-[38px] px-4 rounded-lg bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold"
                  >
                    نعم، استعادة
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmReset(false)}
                    className="min-h-[38px] px-3 rounded-lg text-slate-700 hover:bg-amber-100 text-xs font-medium"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            )}
          </div>

          {status && (
            <div
              role="status"
              className={`p-3 rounded-xl text-xs font-medium ${
                status.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {status.text}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
