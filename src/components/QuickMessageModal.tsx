import { useEffect, useId, useState } from 'react';
import {
  Check,
  MessageCircle,
  MessageSquare,
  Smartphone,
  X,
} from 'lucide-react';
import { ContactChannel, type FamilyMember } from '../types/family';
import {
  buildSmsUri,
  buildViberUri,
  buildWhatsAppUri,
} from '../utils/phone';
import { MemberAvatar } from './MemberAvatar';

interface QuickMessageModalProps {
  member: FamilyMember | null;
  onClose: () => void;
  onRecordContact: (id: string, channel: ContactChannel, label: string) => void;
}

const MESSAGE_TEMPLATES = [
  'السلام عليكم، كيف حالكم اليوم؟',
  'أرجو الاتصال بي عندما تتفرغ.',
  'هل أنتم في المنزل الآن؟',
  'أنا في طريقي إليكم الآن.',
  'صباح الخير، أتمنى لكم يوماً طيباً.',
];

export function QuickMessageModal({
  member,
  onClose,
  onRecordContact,
}: QuickMessageModalProps) {
  const titleId = useId();
  const textareaId = useId();
  const [message, setMessage] = useState(MESSAGE_TEMPLATES[0]);
  const [copiedForViber, setCopiedForViber] = useState(false);

  useEffect(() => {
    if (member) {
      setMessage(MESSAGE_TEMPLATES[0]);
      setCopiedForViber(false);
    }
  }, [member]);

  useEffect(() => {
    if (!member) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [member, onClose]);

  if (!member) return null;

  const handleViberWithCopy = async () => {
    try {
      if (message.trim()) {
        await navigator.clipboard.writeText(message.trim());
        setCopiedForViber(true);
      }
    } catch {
      // Clipboard may fail in sandbox; proceed with opening Viber
    }
    onRecordContact(member.id, ContactChannel.ViberChat, member.name);
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
          <div className="flex items-center gap-3 min-w-0">
            <MemberAvatar
              name={member.name}
              photoUrl={member.photoUrl}
              sizeClass="w-11 h-11"
              roundedClass="rounded-xl"
              textSizeClass="text-base"
            />
            <div className="min-w-0">
              <h2
                id={titleId}
                className="font-display text-lg font-bold text-slate-900 truncate"
              >
                رسالة سريعة إلى {member.name}
              </h2>
              <p className="text-xs text-slate-500">{member.relationLabel}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق نافذة الرسالة السريعة"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <span className="block text-xs font-semibold text-slate-600 mb-2">
              اختر رسالة جاهزة:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {MESSAGE_TEMPLATES.map((tpl) => (
                <button
                  key={tpl}
                  type="button"
                  onClick={() => setMessage(tpl)}
                  className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-medium text-right transition-colors ${
                    message === tpl
                      ? 'bg-[#0F5C4D] text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {tpl}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label
              htmlFor={textareaId}
              className="block text-xs font-semibold text-slate-600 mb-1.5"
            >
              نص الرسالة:
            </label>
            <textarea
              id={textareaId}
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-3.5 rounded-xl border border-slate-300 focus:border-[#0F5C4D] focus:ring-2 focus:ring-[#0F5C4D]/20 outline-none text-sm text-slate-900 resize-none"
            />
          </div>

          <div className="space-y-2.5 pt-1">
            <a
              href={buildWhatsAppUri(member.phone, message)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                onRecordContact(member.id, ContactChannel.WhatsApp, member.name);
                onClose();
              }}
              className="w-full min-h-[48px] flex items-center justify-center gap-2 rounded-xl bg-[#15803D] hover:bg-[#166534] text-white font-semibold text-sm transition-colors"
            >
              <MessageCircle className="w-4 h-4" aria-hidden="true" />
              <span>إرسال الآن عبر واتساب</span>
            </a>

            <a
              href={buildViberUri(member.phone, 'chat')}
              onClick={handleViberWithCopy}
              className="w-full min-h-[48px] flex items-center justify-center gap-2 rounded-xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-semibold text-sm transition-colors"
            >
              {copiedForViber ? (
                <Check className="w-4 h-4" aria-hidden="true" />
              ) : (
                <MessageSquare className="w-4 h-4" aria-hidden="true" />
              )}
              <span>
                {copiedForViber
                  ? 'تم نسخ النص — جاري فتح فايبر'
                  : 'نسخ النص وفتح محادثة فايبر'}
              </span>
            </a>

            <a
              href={buildSmsUri(member.phone, message)}
              onClick={() => {
                onRecordContact(member.id, ContactChannel.Sms, member.name);
                onClose();
              }}
              className="w-full min-h-[44px] flex items-center justify-center gap-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium text-sm transition-colors"
            >
              <Smartphone className="w-4 h-4" aria-hidden="true" />
              <span>إرسال كرسالة نصية (SMS)</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
