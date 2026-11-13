import { useEffect, useId, useRef, useState } from 'react';
import { Camera, Pin, Trash2, Upload, X } from 'lucide-react';
import { PRESET_PORTRAITS } from '../data/seedFamily';
import { RelationCategory, type FamilyMember } from '../types/family';
import { resizePortraitImage } from '../utils/imageResize';
import {
  COUNTRY_CODES,
  formatDisplayPhone,
  normalizePhoneNumber,
  splitPhoneForEditing,
  validatePhoneNumber,
} from '../utils/phone';
import { MemberAvatar } from './MemberAvatar';

interface MemberFormModalProps {
  isOpen: boolean;
  editingMember: FamilyMember | null;
  onClose: () => void;
  onSave: (payload: {
    id?: string;
    name: string;
    relationLabel: string;
    category: RelationCategory;
    phone: string;
    photoUrl: string;
    isPinned: boolean;
    notes?: string;
  }) => void;
}

const RELATION_PRESETS: Array<{
  label: string;
  category: RelationCategory;
}> = [
  { label: 'أمي', category: RelationCategory.Parents },
  { label: 'أبي', category: RelationCategory.Parents },
  { label: 'أخي', category: RelationCategory.Siblings },
  { label: 'أختي', category: RelationCategory.Siblings },
  { label: 'زوجتي', category: RelationCategory.SpouseKids },
  { label: 'زوجي', category: RelationCategory.SpouseKids },
  { label: 'ابني', category: RelationCategory.SpouseKids },
  { label: 'ابنتي', category: RelationCategory.SpouseKids },
  { label: 'جدي', category: RelationCategory.Grandparents },
  { label: 'جدتي', category: RelationCategory.Grandparents },
];

export function MemberFormModal({
  isOpen,
  editingMember,
  onClose,
  onSave,
}: MemberFormModalProps) {
  const titleId = useId();
  const nameInputId = useId();
  const relationInputId = useId();
  const categorySelectId = useId();
  const countrySelectId = useId();
  const phoneInputId = useId();
  const notesInputId = useId();
  const fileInputId = useId();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [relationLabel, setRelationLabel] = useState('أمي');
  const [category, setCategory] = useState<RelationCategory>(
    RelationCategory.Parents
  );
  const [countryCode, setCountryCode] = useState('+964');
  const [localPhone, setLocalPhone] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [isPinned, setIsPinned] = useState(true);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [photoLoading, setPhotoLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (editingMember) {
      const split = splitPhoneForEditing(editingMember.phone);
      setName(editingMember.name);
      setRelationLabel(editingMember.relationLabel);
      setCategory(editingMember.category);
      setCountryCode(split.countryCode);
      setLocalPhone(split.localNumber);
      setPhotoUrl(editingMember.photoUrl);
      setIsPinned(editingMember.isPinned);
      setNotes(editingMember.notes ?? '');
      setError('');
    } else {
      setName('');
      setRelationLabel('أمي');
      setCategory(RelationCategory.Parents);
      setCountryCode('+964');
      setLocalPhone('');
      setPhotoUrl('');
      setIsPinned(true);
      setNotes('');
      setError('');
    }
  }, [isOpen, editingMember]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const selectedCountry =
    COUNTRY_CODES.find((c) => c.code === countryCode) ?? COUNTRY_CODES[0];

  const liveNormalized = normalizePhoneNumber(localPhone, countryCode);

  const handlePhotoUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setPhotoLoading(true);
    try {
      const dataUrl = await resizePortraitImage(file);
      setPhotoUrl(dataUrl);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'تعذر تحميل الصورة المختارة.'
      );
    } finally {
      setPhotoLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedRelation = relationLabel.trim();

    if (!trimmedName) {
      setError('يرجى كتابة اسم الفرد من العائلة.');
      return;
    }

    if (!trimmedRelation) {
      setError('يرجى تحديد صلة القرابة (مثلاً: أمي، أخي).');
      return;
    }

    const phoneValidation = validatePhoneNumber(localPhone, countryCode);
    if (!phoneValidation.valid) {
      setError(phoneValidation.error ?? 'رقم الهاتف غير صالح.');
      return;
    }

    onSave({
      id: editingMember?.id,
      name: trimmedName,
      relationLabel: trimmedRelation,
      category,
      phone: phoneValidation.normalized,
      photoUrl,
      isPinned,
      notes: notes.trim() || undefined,
    });
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
      <div className="bg-white w-full sm:max-w-lg max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl border border-slate-200 shadow-xl">
        {/* Modal Header */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center justify-between gap-4">
          <h2
            id={titleId}
            className="font-display text-xl font-bold text-slate-900"
          >
            {editingMember ? 'تعديل بيانات فرد من العائلة' : 'إضافة فرد من العائلة'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق النافذة"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="p-6 space-y-5">
          {/* Photo Picker Section */}
          <div>
            <span className="block text-sm font-semibold text-slate-800 mb-2">
              الصورة الشخصية
            </span>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <MemberAvatar
                name={name || 'ع'}
                photoUrl={photoUrl}
                sizeClass="w-20 h-20"
                roundedClass="rounded-2xl"
                textSizeClass="text-2xl"
              />

              <div className="flex flex-wrap items-center gap-2">
                <input
                  ref={fileInputRef}
                  id={fileInputId}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="sr-only"
                />
                <label
                  htmlFor={fileInputId}
                  className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-medium cursor-pointer transition-colors"
                >
                  {photoLoading ? (
                    <span>جاري المعالجة...</span>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" aria-hidden="true" />
                      <span>رفع صورة من الجهاز</span>
                    </>
                  )}
                </label>

                {photoUrl && (
                  <button
                    type="button"
                    onClick={() => setPhotoUrl('')}
                    className="min-h-[44px] inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-rose-700 hover:bg-rose-50 text-sm font-medium transition-colors"
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                    <span>إزالة</span>
                  </button>
                )}
              </div>
            </div>

            {/* Quick sample portraits if user wants to pick one immediately */}
            <div className="mt-3">
              <span className="block text-xs text-slate-500 mb-1.5">
                أو اختر صورة جاهزة للتجربة:
              </span>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {PRESET_PORTRAITS.map((preset) => (
                  <button
                    key={preset.url}
                    type="button"
                    onClick={() => setPhotoUrl(preset.url)}
                    aria-label={preset.label}
                    className={`w-11 h-11 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                      photoUrl === preset.url
                        ? 'border-[#0F5C4D] ring-2 ring-[#0F5C4D]/25'
                        : 'border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    <img
                      src={preset.url}
                      alt={preset.label}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  aria-label="التقاط أو اختيار صورة جديدة"
                  className="w-11 h-11 rounded-xl border border-dashed border-slate-300 hover:border-[#0F5C4D] flex items-center justify-center text-slate-500 hover:text-[#0F5C4D] shrink-0"
                >
                  <Camera className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>

          {/* Name */}
          <div>
            <label
              htmlFor={nameInputId}
              className="block text-sm font-semibold text-slate-800 mb-1.5"
            >
              الاسم <span className="text-rose-600">*</span>
            </label>
            <input
              id={nameInputId}
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              placeholder="مثال: أمي الحبيبة، أو خالد"
              required
              className="w-full min-h-[46px] px-4 py-2.5 rounded-xl border border-slate-300 focus:border-[#0F5C4D] focus:ring-2 focus:ring-[#0F5C4D]/20 outline-none text-slate-900 bg-white"
            />
          </div>

          {/* Relation Presets + Custom Input */}
          <div>
            <label
              htmlFor={relationInputId}
              className="block text-sm font-semibold text-slate-800 mb-1.5"
            >
              صلة القرابة <span className="text-rose-600">*</span>
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2.5">
              {RELATION_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    setRelationLabel(preset.label);
                    setCategory(preset.category);
                  }}
                  className={`min-h-[36px] px-3 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                    relationLabel === preset.label
                      ? 'bg-[#0F5C4D] text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                id={relationInputId}
                type="text"
                value={relationLabel}
                onChange={(e) => setRelationLabel(e.target.value)}
                placeholder="مثال: خالي، عمتي..."
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 focus:border-[#0F5C4D] focus:ring-2 focus:ring-[#0F5C4D]/20 outline-none text-sm text-slate-900 bg-white"
              />

              <div>
                <label htmlFor={categorySelectId} className="sr-only">
                  التصنيف
                </label>
                <select
                  id={categorySelectId}
                  value={category}
                  onChange={(e) =>
                    setCategory(e.target.value as RelationCategory)
                  }
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 focus:border-[#0F5C4D] focus:ring-2 focus:ring-[#0F5C4D]/20 outline-none text-sm text-slate-900 bg-white"
                >
                  <option value={RelationCategory.Parents}>الوالدان</option>
                  <option value={RelationCategory.Siblings}>الإخوة</option>
                  <option value={RelationCategory.SpouseKids}>
                    الأسرة والأبناء
                  </option>
                  <option value={RelationCategory.Grandparents}>الأجداد</option>
                  <option value={RelationCategory.Other}>أقارب آخرون</option>
                </select>
              </div>
            </div>
          </div>

          {/* Phone Number + Country Code */}
          <div>
            <label
              htmlFor={phoneInputId}
              className="block text-sm font-semibold text-slate-800 mb-1.5"
            >
              رقم الهاتف <span className="text-rose-600">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
              <div className="sm:col-span-2">
                <label htmlFor={countrySelectId} className="sr-only">
                  رمز البلد
                </label>
                <select
                  id={countrySelectId}
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="w-full min-h-[46px] px-3 py-2 rounded-xl border border-slate-300 focus:border-[#0F5C4D] focus:ring-2 focus:ring-[#0F5C4D]/20 outline-none text-sm text-slate-900 bg-white"
                >
                  {COUNTRY_CODES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.countryAr}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-3">
                <input
                  id={phoneInputId}
                  type="tel"
                  inputMode="tel"
                  dir="ltr"
                  value={localPhone}
                  onChange={(e) => {
                    setLocalPhone(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder={selectedCountry.placeholder}
                  required
                  className="w-full min-h-[46px] px-4 py-2.5 rounded-xl border border-slate-300 focus:border-[#0F5C4D] focus:ring-2 focus:ring-[#0F5C4D]/20 outline-none text-slate-900 bg-white text-left tabular-nums"
                />
              </div>
            </div>

            {liveNormalized && (
              <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1.5">
                <span>الصيغة الدولية للواتساب والفايبر:</span>
                <span dir="ltr" className="font-semibold text-slate-700 tabular-nums">
                  {formatDisplayPhone(liveNormalized)}
                </span>
              </p>
            )}
          </div>

          {/* Optional Note */}
          <div>
            <label
              htmlFor={notesInputId}
              className="block text-sm font-semibold text-slate-800 mb-1.5"
            >
              ملاحظة قصيرة (اختياري)
            </label>
            <input
              id={notesInputId}
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثال: متواجد بعد الساعة الخامسة مساءً"
              className="w-full min-h-[44px] px-4 py-2 rounded-xl border border-slate-300 focus:border-[#0F5C4D] focus:ring-2 focus:ring-[#0F5C4D]/20 outline-none text-sm text-slate-900 bg-white"
            />
          </div>

          {/* Pin Toggle */}
          <label className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
            <div className="flex items-center gap-2.5">
              <Pin className="w-4 h-4 text-amber-600 shrink-0" aria-hidden="true" />
              <div>
                <span className="block text-sm font-semibold text-slate-900">
                  تثبيت في أعلى الصفحة
                </span>
                <span className="block text-xs text-slate-500">
                  يظهر في شريط الاتصال السريع فور فتح التطبيق
                </span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={isPinned}
              onChange={(e) => setIsPinned(e.target.checked)}
              className="w-5 h-5 accent-[#0F5C4D] rounded"
            />
          </label>

          {error && (
            <div
              role="alert"
              className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-medium"
            >
              {error}
            </div>
          )}

          {/* Submit Footer */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[46px] px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-semibold transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="min-h-[46px] px-6 py-2.5 rounded-xl bg-[#0F5C4D] hover:bg-[#0B473B] text-white text-sm font-semibold transition-colors shadow-sm"
            >
              {editingMember ? 'حفظ التعديلات' : 'حفظ وتثبيت الرقم'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
