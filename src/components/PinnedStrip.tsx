import {
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Phone,
  PhoneCall,
  PinOff,
} from 'lucide-react';
import { ContactChannel, type FamilyMember } from '../types/family';
import {
  buildCallUri,
  buildViberUri,
  buildWhatsAppUri,
} from '../utils/phone';
import { MemberAvatar } from './MemberAvatar';

interface PinnedStripProps {
  pinnedMembers: FamilyMember[];
  onRecordContact: (id: string, channel: ContactChannel, label: string) => void;
  onTogglePin: (id: string) => void;
  onMovePinned: (id: string, direction: 'earlier' | 'later') => void;
}

export function PinnedStrip({
  pinnedMembers,
  onRecordContact,
  onTogglePin,
  onMovePinned,
}: PinnedStripProps) {
  if (pinnedMembers.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="pinned-heading" className="mb-10">
      <div className="flex items-baseline justify-between gap-4 mb-4">
        <div>
          <h2
            id="pinned-heading"
            className="font-display text-xl sm:text-2xl font-bold text-slate-900"
          >
            الاتصال السريع المثبّت
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            أقرب أفراد عائلتك للوصول الفوري بضغطة واحدة
          </p>
        </div>
        <span className="text-xs font-medium text-slate-500 tabular-nums shrink-0">
          {pinnedMembers.length} مثبت
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {pinnedMembers.map((member, index) => (
          <article
            key={member.id}
            className="bg-white border border-[#E4E7E2] rounded-2xl p-4 shadow-xs flex flex-col justify-between gap-4 transition-shadow hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3.5 min-w-0">
                <MemberAvatar
                  name={member.name}
                  photoUrl={member.photoUrl}
                  sizeClass="w-16 h-16"
                  roundedClass="rounded-2xl"
                  textSizeClass="text-2xl"
                />
                <div className="min-w-0">
                  <h3 className="font-display text-lg font-bold text-slate-900 truncate">
                    {member.name}
                  </h3>
                  <p className="text-xs font-medium text-[#0F5C4D] truncate mt-0.5">
                    {member.relationLabel}
                  </p>
                </div>
              </div>

              <div className="flex items-center shrink-0">
                {pinnedMembers.length > 1 && (
                  <>
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => onMovePinned(member.id, 'earlier')}
                      aria-label={`تقديم ${member.name}`}
                      className="min-h-[36px] min-w-[28px] flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      disabled={index === pinnedMembers.length - 1}
                      onClick={() => onMovePinned(member.id, 'later')}
                      aria-label={`تأخير ${member.name}`}
                      className="min-h-[36px] min-w-[28px] flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => onTogglePin(member.id)}
                  aria-label={`إلغاء تثبيت ${member.name}`}
                  title="إلغاء التثبيت"
                  className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg text-amber-600 hover:bg-amber-50 transition-colors"
                >
                  <PinOff className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <a
                href={buildCallUri(member.phone)}
                onClick={() =>
                  onRecordContact(member.id, ContactChannel.Phone, member.name)
                }
                aria-label={`اتصال هاتفي بـ ${member.name}`}
                className="min-h-[44px] flex flex-col items-center justify-center gap-1 rounded-xl bg-[#0369A1] hover:bg-[#075985] active:scale-[0.98] text-white text-xs font-semibold transition-all py-2 px-1 whitespace-nowrap"
              >
                <Phone className="w-4 h-4" aria-hidden="true" />
                <span>اتصال</span>
              </a>

              <a
                href={buildWhatsAppUri(member.phone)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  onRecordContact(
                    member.id,
                    ContactChannel.WhatsApp,
                    member.name
                  )
                }
                aria-label={`واتساب ${member.name}`}
                className="min-h-[44px] flex flex-col items-center justify-center gap-1 rounded-xl bg-[#15803D] hover:bg-[#166534] active:scale-[0.98] text-white text-xs font-semibold transition-all py-2 px-1 whitespace-nowrap"
              >
                <MessageCircle className="w-4 h-4" aria-hidden="true" />
                <span>واتساب</span>
              </a>

              <a
                href={buildViberUri(member.phone, 'call')}
                onClick={() =>
                  onRecordContact(
                    member.id,
                    ContactChannel.ViberCall,
                    member.name
                  )
                }
                aria-label={`اتصال فايبر بـ ${member.name}`}
                className="min-h-[44px] flex flex-col items-center justify-center gap-1 rounded-xl bg-[#6D28D9] hover:bg-[#5B21B6] active:scale-[0.98] text-white text-xs font-semibold transition-all py-2 px-1 whitespace-nowrap"
              >
                <PhoneCall className="w-4 h-4" aria-hidden="true" />
                <span>فايبر</span>
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
