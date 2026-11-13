import { useState } from 'react';
import {
  Check,
  Copy,
  MessageCircle,
  MessageSquare,
  Pencil,
  Phone,
  PhoneCall,
  Pin,
  PinOff,
  Send,
  Trash2,
} from 'lucide-react';
import { ContactChannel, type FamilyMember, type ViewMode } from '../types/family';
import {
  channelLabelAr,
  formatRelativeContactTime,
} from '../utils/contacts';
import {
  buildCallUri,
  buildViberUri,
  buildWhatsAppUri,
  formatDisplayPhone,
} from '../utils/phone';
import { MemberAvatar } from './MemberAvatar';

interface ContactCardProps {
  member: FamilyMember;
  viewMode: ViewMode;
  onRecordContact: (id: string, channel: ContactChannel, label: string) => void;
  onTogglePin: (id: string) => void;
  onEdit: (member: FamilyMember) => void;
  onDelete: (id: string) => void;
  onOpenQuickMessage: (member: FamilyMember) => void;
}

export function ContactCard({
  member,
  viewMode,
  onRecordContact,
  onTogglePin,
  onEdit,
  onDelete,
  onOpenQuickMessage,
}: ContactCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [copied, setCopied] = useState(false);

  const isComfort = viewMode === 'comfort';
  const relativeTime = formatRelativeContactTime(member.lastContactedAt);
  const channelText = channelLabelAr(member.lastChannel);

  const handleCopyNumber = async () => {
    try {
      await navigator.clipboard.writeText(member.phone);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard might be unavailable in restricted contexts; ignore silently
    }
  };

  return (
    <article
      data-testid={`contact-card-${member.id}`}
      className={`bg-white border border-[#E4E7E2] rounded-2xl shadow-xs flex flex-col justify-between transition-shadow hover:shadow-md ${
        isComfort ? 'p-6 gap-6' : 'p-5 gap-5'
      }`}
    >
      {/* Top Identity & Management Row */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3.5 min-w-0">
            <MemberAvatar
              name={member.name}
              photoUrl={member.photoUrl}
              sizeClass={isComfort ? 'w-24 h-24 sm:w-28 sm:h-28' : 'w-20 h-20'}
              roundedClass="rounded-2xl"
              textSizeClass={isComfort ? 'text-4xl' : 'text-3xl'}
            />

            <div className="min-w-0">
              <h3
                className={`font-display font-bold text-slate-900 truncate ${
                  isComfort ? 'text-2xl' : 'text-xl'
                }`}
              >
                {member.name}
              </h3>

              <p className="text-sm font-medium text-[#0F5C4D] mt-0.5">
                {member.relationLabel}
              </p>

              <button
                type="button"
                onClick={handleCopyNumber}
                title="نسخ رقم الهاتف"
                aria-label={`نسخ رقم ${member.name}`}
                className="mt-1 inline-flex items-center gap-1.5 text-sm text-slate-700 hover:text-[#0F5C4D] transition-colors font-medium tabular-nums whitespace-nowrap"
              >
                <span dir="ltr">{formatDisplayPhone(member.phone)}</span>
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" aria-hidden="true" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          {/* Action Icons: Pin, Edit, Delete */}
          <div className="flex items-center gap-0.5 shrink-0">
            <button
              type="button"
              onClick={() => onTogglePin(member.id)}
              aria-label={
                member.isPinned
                  ? `إلغاء تثبيت ${member.name}`
                  : `تثبيت ${member.name} في الأعلى`
              }
              aria-pressed={member.isPinned}
              title={member.isPinned ? 'إلغاء التثبيت' : 'تثبيت في الأعلى'}
              className={`min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl transition-colors ${
                member.isPinned
                  ? 'text-amber-600 bg-amber-50 hover:bg-amber-100'
                  : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
              }`}
            >
              {member.isPinned ? (
                <PinOff className="w-4 h-4" aria-hidden="true" />
              ) : (
                <Pin className="w-4 h-4" aria-hidden="true" />
              )}
            </button>

            <button
              type="button"
              onClick={() => onEdit(member)}
              aria-label={`تعديل بيانات ${member.name}`}
              title="تعديل"
              className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            >
              <Pencil className="w-4 h-4" aria-hidden="true" />
            </button>

            {!confirmDelete ? (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                aria-label={`حذف ${member.name}`}
                title="حذف"
                className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-slate-400 hover:text-rose-700 hover:bg-rose-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" aria-hidden="true" />
              </button>
            ) : (
              <div className="flex items-center gap-1 bg-rose-50 border border-rose-200 rounded-xl px-2 py-1">
                <button
                  type="button"
                  onClick={() => onDelete(member.id)}
                  aria-label={`تأكيد حذف ${member.name}`}
                  className="min-h-[34px] px-2.5 rounded-lg bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold whitespace-nowrap"
                >
                  تأكيد
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  aria-label={`إلغاء حذف ${member.name}`}
                  className="min-h-[34px] px-2 rounded-lg text-slate-600 hover:text-slate-900 text-xs font-medium whitespace-nowrap"
                >
                  تراجع
                </button>
              </div>
            )}
          </div>
        </div>

        {(member.notes || (relativeTime && channelText)) && (
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 pt-1 border-t border-slate-100">
            {member.notes && <span>{member.notes}</span>}
            {member.notes && relativeTime && channelText && (
              <span aria-hidden="true" className="text-slate-300">
                ·
              </span>
            )}
            {relativeTime && channelText && (
              <span className="text-slate-400">
                آخر تواصل: {relativeTime} عبر {channelText}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Primary Action Dock: Cellular Call + WhatsApp + Viber Call + Viber Chat & Quick Message */}
      <div className="flex flex-col gap-2.5">
        {/* Primary Cellular Voice Call */}
        <a
          href={buildCallUri(member.phone)}
          onClick={() =>
            onRecordContact(member.id, ContactChannel.Phone, member.name)
          }
          aria-label={`اتصال هاتفي اعتيادي بـ ${member.name}`}
          className={`w-full flex items-center justify-center gap-2.5 rounded-xl bg-[#0369A1] hover:bg-[#075985] active:scale-[0.99] text-white font-semibold transition-all shadow-xs whitespace-nowrap ${
            isComfort ? 'min-h-[56px] text-lg px-5' : 'min-h-[48px] text-base px-4'
          }`}
        >
          <Phone className={isComfort ? 'w-5 h-5' : 'w-4 h-4'} aria-hidden="true" />
          <span>اتصال هاتفي (موبايل)</span>
        </a>

        {/* WhatsApp & Viber Call Row */}
        <div className="grid grid-cols-2 gap-2.5">
          <a
            href={buildWhatsAppUri(member.phone)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              onRecordContact(member.id, ContactChannel.WhatsApp, member.name)
            }
            aria-label={`اتصال ومراسلة واتساب مع ${member.name}`}
            className={`flex items-center justify-center gap-2 rounded-xl bg-[#15803D] hover:bg-[#166534] active:scale-[0.99] text-white font-semibold transition-all whitespace-nowrap ${
              isComfort
                ? 'min-h-[52px] text-base px-4'
                : 'min-h-[46px] text-sm px-3'
            }`}
          >
            <MessageCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>واتساب</span>
          </a>

          <a
            href={buildViberUri(member.phone, 'call')}
            onClick={() =>
              onRecordContact(member.id, ContactChannel.ViberCall, member.name)
            }
            aria-label={`اتصال صوتي فايبر مع ${member.name}`}
            className={`flex items-center justify-center gap-2 rounded-xl bg-[#6D28D9] hover:bg-[#5B21B6] active:scale-[0.99] text-white font-semibold transition-all whitespace-nowrap ${
              isComfort
                ? 'min-h-[52px] text-base px-4'
                : 'min-h-[46px] text-sm px-3'
            }`}
          >
            <PhoneCall className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>اتصال فايبر</span>
          </a>
        </div>

        {/* Secondary Messaging Row: Viber Chat + Quick Pre-written Message */}
        <div className="grid grid-cols-2 gap-2.5">
          <a
            href={buildViberUri(member.phone, 'chat')}
            onClick={() =>
              onRecordContact(member.id, ContactChannel.ViberChat, member.name)
            }
            aria-label={`مراسلة فايبر مع ${member.name}`}
            className="min-h-[44px] flex items-center justify-center gap-2 rounded-xl bg-violet-50 hover:bg-violet-100 text-violet-900 border border-violet-200/80 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap px-3"
          >
            <MessageSquare className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>محادثة فايبر</span>
          </a>

          <button
            type="button"
            onClick={() => onOpenQuickMessage(member)}
            aria-label={`إرسال رسالة سريعة إلى ${member.name}`}
            className="min-h-[44px] flex items-center justify-center gap-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-800 border border-slate-200/70 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap px-3"
          >
            <Send className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>رسالة سريعة</span>
          </button>
        </div>
      </div>
    </article>
  );
}
