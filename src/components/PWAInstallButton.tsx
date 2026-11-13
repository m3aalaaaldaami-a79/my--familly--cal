import { useEffect, useId, useState } from 'react';
import { Download, MoreVertical, Share, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export function PWAInstallButton() {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);
  const titleId = useId();

  useEffect(() => {
    if (!showGuide) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowGuide(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showGuide]);

  if (isInstalled) {
    return null;
  }

  const handleClick = async () => {
    if (isInstallable) {
      const accepted = await install();
      if (accepted) return;
    }
    setShowGuide(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        aria-label="تثبيت عائلتي كتطبيق على الهاتف"
        className="min-h-[42px] inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-[#0F5C4D] border border-teal-200 text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
      >
        <Download className="w-4 h-4 shrink-0" aria-hidden="true" />
        <span>تثبيت التطبيق</span>
      </button>

      {showGuide && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs p-0 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowGuide(false);
          }}
        >
          <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#0F5C4D] text-white flex items-center justify-center shrink-0">
                  <Smartphone className="w-5 h-5" aria-hidden="true" />
                </div>
                <h2
                  id={titleId}
                  className="font-display text-lg font-bold text-slate-900"
                >
                  تثبيت «عائلتي» كتطبيق على الهاتف
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setShowGuide(false)}
                aria-label="إغلاق دليل التثبيت"
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-sm text-slate-700 leading-relaxed">
              {isInstallable && (
                <button
                  type="button"
                  onClick={() => {
                    void install();
                  }}
                  className="w-full min-h-[48px] flex items-center justify-center gap-2 rounded-xl bg-[#0F5C4D] hover:bg-[#0B473B] text-white font-semibold transition-colors"
                >
                  <Download className="w-4 h-4" aria-hidden="true" />
                  <span>تثبيت فوري الآن</span>
                </button>
              )}

              {!isIOS ? (
                <div className="space-y-3">
                  <p className="font-semibold text-slate-900">
                    لتثبيت التطبيق على أندرويد (متصفح Chrome):
                  </p>
                  <ol className="space-y-2.5 text-slate-700 list-decimal list-inside">
                    <li>
                      افتح رابط التطبيق مباشرة في متصفح <strong>Chrome</strong>{' '}
                      على هاتفك الأندرويد.
                    </li>
                    <li>
                      اضغط على أيقونة القائمة{' '}
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-slate-100 text-slate-800 align-middle mx-0.5">
                        <MoreVertical className="w-3.5 h-3.5" aria-hidden="true" />
                      </span>{' '}
                      أعلى المتصفح.
                    </li>
                    <li>
                      اختر <strong>تثبيت التطبيق (Install app)</strong> أو{' '}
                      <strong>إضافة إلى الشاشة الرئيسية</strong>.
                    </li>
                    <li>
                      سيظهر تطبيق <strong>عائلتي</strong> بأيقونته الخاصة على
                      شاشة هاتفك ويعمل حتى بدون إنترنت للاتصال الهاتفي.
                    </li>
                  </ol>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="font-semibold text-slate-900">
                    لتثبيت التطبيق على آيفون / آيباد (Safari):
                  </p>
                  <ol className="space-y-2.5 text-slate-700 list-decimal list-inside">
                    <li>
                      اضغط على زر المشاركة{' '}
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-slate-100 text-slate-800 align-middle mx-0.5">
                        <Share className="w-3.5 h-3.5" aria-hidden="true" />
                      </span>{' '}
                      في أسفل متصفح Safari.
                    </li>
                    <li>
                      مرّر للأسفل واختر{' '}
                      <strong>إضافة إلى الصفحة الرئيسية (Add to Home Screen)</strong>.
                    </li>
                    <li>
                      اضغط <strong>إضافة</strong> لتثبيت الأيقونة على شاشتك.
                    </li>
                  </ol>
                </div>
              )}

              <button
                type="button"
                onClick={() => setShowGuide(false)}
                className="w-full min-h-[44px] rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-sm transition-colors"
              >
                حسناً، فهمت
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
