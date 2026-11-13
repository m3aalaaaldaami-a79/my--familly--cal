import motherPortrait from '../assets/images/family_mother_1794558833669.jpg';
import fatherPortrait from '../assets/images/family_father_1794558834363.jpg';
import sisterPortrait from '../assets/images/family_sister_1794558834678.jpg';
import brotherPortrait from '../assets/images/family_brother_1794558835782.jpg';
import grandmotherPortrait from '../assets/images/family_grandmother_1794558835525.jpg';
import { RelationCategory, type FamilyMember } from '../types/family';

export const SEED_FAMILY_MEMBERS: FamilyMember[] = [
  {
    id: 'seed_mother',
    name: 'أمي الحبيبة',
    relationLabel: 'الوالدة',
    category: RelationCategory.Parents,
    phone: '+9647701234501',
    photoUrl: motherPortrait,
    isPinned: true,
    notes: 'الاتصال للاطمئنان اليومي',
    createdAt: 1700000001000,
    order: 0,
  },
  {
    id: 'seed_father',
    name: 'أبي الغالي',
    relationLabel: 'الوالد',
    category: RelationCategory.Parents,
    phone: '+9647701234502',
    photoUrl: fatherPortrait,
    isPinned: true,
    notes: 'يفضّل الاتصال الهاتفي المباشر',
    createdAt: 1700000002000,
    order: 1,
  },
  {
    id: 'seed_sister',
    name: 'مريم',
    relationLabel: 'أختي',
    category: RelationCategory.Siblings,
    phone: '+9647802345603',
    photoUrl: sisterPortrait,
    isPinned: true,
    createdAt: 1700000003000,
    order: 2,
  },
  {
    id: 'seed_brother',
    name: 'عمر',
    relationLabel: 'أخي',
    category: RelationCategory.Siblings,
    phone: '+9647713456704',
    photoUrl: brotherPortrait,
    isPinned: false,
    createdAt: 1700000004000,
    order: 3,
  },
  {
    id: 'seed_grandmother',
    name: 'جدتي أم أحمد',
    relationLabel: 'الجدة',
    category: RelationCategory.Grandparents,
    phone: '+9647904567805',
    photoUrl: grandmotherPortrait,
    isPinned: false,
    notes: 'متواجدة في المنزل صباحاً',
    createdAt: 1700000005000,
    order: 4,
  },
];

export const PRESET_PORTRAITS: Array<{ label: string; url: string }> = [
  { label: 'صورة الأم', url: motherPortrait },
  { label: 'صورة الأب', url: fatherPortrait },
  { label: 'صورة الأخت', url: sisterPortrait },
  { label: 'صورة الأخ', url: brotherPortrait },
  { label: 'صورة الجدة', url: grandmotherPortrait },
];
