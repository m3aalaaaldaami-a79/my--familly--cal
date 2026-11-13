import {
  ContactChannel,
  RelationCategory,
  type FamilyMember,
} from '../types/family';
import { normalizePhoneNumber, toAsciiDigits } from './phone';

export interface MemberFilterOptions {
  query?: string;
  category?: RelationCategory | 'all' | 'pinned';
}

export const CATEGORY_LABELS: Record<RelationCategory | 'all' | 'pinned', string> = {
  all: 'الكل',
  pinned: 'المثبّتون',
  [RelationCategory.Parents]: 'الوالدان',
  [RelationCategory.Siblings]: 'الإخوة',
  [RelationCategory.SpouseKids]: 'الأسرة والأبناء',
  [RelationCategory.Grandparents]: 'الأجداد',
  [RelationCategory.Other]: 'أقارب آخرون',
};

export function filterAndSortMembers(
  members: FamilyMember[],
  options: MemberFilterOptions = {}
): FamilyMember[] {
  const rawQuery = (options.query ?? '').trim().toLowerCase();
  const asciiQueryDigits = toAsciiDigits(rawQuery).replace(/\D/g, '');
  const category = options.category ?? 'all';

  return members
    .filter((member) => {
      if (category === 'pinned' && !member.isPinned) {
        return false;
      }
      if (
        category !== 'all' &&
        category !== 'pinned' &&
        member.category !== category
      ) {
        return false;
      }

      if (!rawQuery) return true;

      const nameMatch = member.name.toLowerCase().includes(rawQuery);
      const relationMatch = member.relationLabel
        .toLowerCase()
        .includes(rawQuery);
      const notesMatch = (member.notes ?? '').toLowerCase().includes(rawQuery);
      const phoneDigits = member.phone.replace(/\D/g, '');
      const phoneMatch =
        asciiQueryDigits.length > 0 && phoneDigits.includes(asciiQueryDigits);

      return nameMatch || relationMatch || notesMatch || phoneMatch;
    })
    .sort((a, b) => {
      if (a.isPinned !== b.isPinned) {
        return a.isPinned ? -1 : 1;
      }
      if (a.order !== b.order) {
        return a.order - b.order;
      }
      return a.createdAt - b.createdAt;
    });
}

export function toggleMemberPin(
  members: FamilyMember[],
  memberId: string
): FamilyMember[] {
  return members.map((member) =>
    member.id === memberId ? { ...member, isPinned: !member.isPinned } : member
  );
}

export function recordMemberContact(
  members: FamilyMember[],
  memberId: string,
  channel: ContactChannel,
  timestamp = Date.now()
): FamilyMember[] {
  return members.map((member) =>
    member.id === memberId
      ? { ...member, lastContactedAt: timestamp, lastChannel: channel }
      : member
  );
}

export function movePinnedMember(
  members: FamilyMember[],
  memberId: string,
  direction: 'earlier' | 'later'
): FamilyMember[] {
  const pinned = members
    .filter((m) => m.isPinned)
    .sort((a, b) => a.order - b.order);

  const idx = pinned.findIndex((m) => m.id === memberId);
  if (idx === -1) return members;

  const swapIdx = direction === 'earlier' ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= pinned.length) return members;

  const updatedPinned = [...pinned];
  const currentOrder = updatedPinned[idx].order;
  const targetOrder = updatedPinned[swapIdx].order;

  // Ensure distinct order numbers even if two items shared an order
  const newOrderA = currentOrder === targetOrder ? swapIdx : targetOrder;
  const newOrderB = currentOrder === targetOrder ? idx : currentOrder;

  const currentId = updatedPinned[idx].id;
  const targetId = updatedPinned[swapIdx].id;

  return members.map((m) => {
    if (m.id === currentId) return { ...m, order: newOrderA };
    if (m.id === targetId) return { ...m, order: newOrderB };
    return m;
  });
}

export function formatRelativeContactTime(
  timestamp?: number,
  now = Date.now()
): string | null {
  if (!timestamp) return null;
  const diffMs = Math.max(0, now - timestamp);
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 1) return 'الآن';
  if (diffMinutes < 60) return `منذ ${diffMinutes} دقيقة`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `منذ ${diffHours} ساعة`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'منذ يوم';
  return `منذ ${diffDays} أيام`;
}

export function channelLabelAr(channel?: ContactChannel): string {
  switch (channel) {
    case ContactChannel.Phone:
      return 'اتصال هاتفي';
    case ContactChannel.WhatsApp:
      return 'واتساب';
    case ContactChannel.ViberCall:
      return 'اتصال فايبر';
    case ContactChannel.ViberChat:
      return 'محادثة فايبر';
    case ContactChannel.Sms:
      return 'رسالة نصية';
    default:
      return '';
  }
}

export function parseImportedContacts(jsonText: string): {
  ok: boolean;
  members?: FamilyMember[];
  error?: string;
} {
  try {
    const parsed = JSON.parse(jsonText);
    const rawList = Array.isArray(parsed)
      ? parsed
      : Array.isArray(parsed?.members)
        ? parsed.members
        : null;

    if (!rawList) {
      return {
        ok: false,
        error: 'ملف النسخة الاحتياطية غير صالح: لا يحتوي على قائمة أفراد العائلة.',
      };
    }

    const validCategories = new Set(Object.values(RelationCategory));
    const sanitized: FamilyMember[] = [];

    for (let i = 0; i < rawList.length; i++) {
      const item = rawList[i];
      if (!item || typeof item !== 'object') continue;
      const name = typeof item.name === 'string' ? item.name.trim() : '';
      const rawPhone = typeof item.phone === 'string' ? item.phone : '';
      const phone = normalizePhoneNumber(rawPhone);
      if (!name || phone.replace(/\D/g, '').length < 8) continue;

      const category = validCategories.has(item.category)
        ? (item.category as RelationCategory)
        : RelationCategory.Other;

      sanitized.push({
        id:
          typeof item.id === 'string' && item.id.trim()
            ? item.id
            : `imported_${Date.now()}_${i}`,
        name,
        relationLabel:
          typeof item.relationLabel === 'string' && item.relationLabel.trim()
            ? item.relationLabel.trim()
            : 'فرد من العائلة',
        category,
        phone,
        photoUrl: typeof item.photoUrl === 'string' ? item.photoUrl : '',
        isPinned: Boolean(item.isPinned),
        notes: typeof item.notes === 'string' ? item.notes : undefined,
        lastContactedAt:
          typeof item.lastContactedAt === 'number'
            ? item.lastContactedAt
            : undefined,
        lastChannel: item.lastChannel,
        createdAt:
          typeof item.createdAt === 'number' ? item.createdAt : Date.now(),
        order: typeof item.order === 'number' ? item.order : i,
      });
    }

    if (sanitized.length === 0) {
      return {
        ok: false,
        error: 'لم يتم العثور على أرقام عائلية صالحة داخل الملف.',
      };
    }

    return { ok: true, members: sanitized };
  } catch {
    return {
      ok: false,
      error: 'تعذر قراءة الملف. تأكد من اختيار ملف نسخة احتياطية بصيغة JSON.',
    };
  }
}
