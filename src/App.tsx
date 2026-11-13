import { useEffect, useMemo, useState } from 'react';
import {
  Archive,
  LayoutGrid,
  Maximize2,
  Search,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { BackupModal } from './components/BackupModal';
import { ContactCard } from './components/ContactCard';
import { MemberFormModal } from './components/MemberFormModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { PinnedStrip } from './components/PinnedStrip';
import { PWAInstallButton } from './components/PWAInstallButton';
import { QuickMessageModal } from './components/QuickMessageModal';
import { TopBar } from './components/TopBar';
import { SEED_FAMILY_MEMBERS } from './data/seedFamily';
import {
  ContactChannel,
  RelationCategory,
  type FamilyMember,
  type ViewMode,
} from './types/family';
import {
  CATEGORY_LABELS,
  channelLabelAr,
  filterAndSortMembers,
  movePinnedMember,
  recordMemberContact,
  toggleMemberPin,
} from './utils/contacts';

const STORAGE_KEY = 'ailati_family_members_v1';
const VIEW_MODE_KEY = 'ailati_view_mode_v1';

function loadInitialMembers(): FamilyMember[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return SEED_FAMILY_MEMBERS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch {
    // Fallback to seed data if storage is unavailable or corrupted
  }
  return SEED_FAMILY_MEMBERS;
}

function loadInitialViewMode(): ViewMode {
  try {
    const raw = localStorage.getItem(VIEW_MODE_KEY);
    if (raw === 'comfort' || raw === 'grid') return raw;
  } catch {
    // Ignore storage read errors
  }
  return 'grid';
}

export default function App() {
  const [members, setMembers] = useState<FamilyMember[]>(loadInitialMembers);
  const [viewMode, setViewMode] = useState<ViewMode>(loadInitialViewMode);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<
    RelationCategory | 'all' | 'pinned'
  >('all');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [quickMessageMember, setQuickMessageMember] =
    useState<FamilyMember | null>(null);
  const [isBackupOpen, setIsBackupOpen] = useState(false);
  const [toastText, setToastText] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
    } catch {
      setToastText(
        'تنبيه: مساحة التخزين في المتصفح ممتلئة، جرّب استخدام صور أصغر حجماً.'
      );
    }
  }, [members]);

  useEffect(() => {
    try {
      localStorage.setItem(VIEW_MODE_KEY, viewMode);
    } catch {
      // Ignore storage write errors
    }
  }, [viewMode]);

  useEffect(() => {
    if (!toastText) return;
    const timer = setTimeout(() => setToastText(null), 3200);
    return () => clearTimeout(timer);
  }, [toastText]);

  const pinnedMembers = useMemo(
    () => filterAndSortMembers(members, { category: 'pinned' }),
    [members]
  );

  const visibleMembers = useMemo(
    () =>
      filterAndSortMembers(members, {
        query: searchQuery,
        category: activeCategory,
      }),
    [members, searchQuery, activeCategory]
  );

  const handleRecordContact = (
    id: string,
    channel: ContactChannel,
    memberName: string
  ) => {
    setMembers((prev) => recordMemberContact(prev, id, channel));
    setToastText(`جاري فتح ${channelLabelAr(channel)} مع ${memberName}`);
  };

  const handleTogglePin = (id: string) => {
    const target = members.find((m) => m.id === id);
    setMembers((prev) => toggleMemberPin(prev, id));
    if (target) {
      setToastText(
        target.isPinned
          ? `تم إلغاء تثبيت ${target.name}`
          : `تم تثبيت ${target.name} في الاتصال السريع`
      );
    }
  };

  const handleMovePinned = (id: string, direction: 'earlier' | 'later') => {
    setMembers((prev) => movePinnedMember(prev, id, direction));
  };

  const handleSaveMember = (payload: {
    id?: string;
    name: string;
    relationLabel: string;
    category: RelationCategory;
    phone: string;
    photoUrl: string;
    isPinned: boolean;
    notes?: string;
  }) => {
    if (payload.id) {
      setMembers((prev) =>
        prev.map((m) =>
          m.id === payload.id
            ? {
                ...m,
                name: payload.name,
                relationLabel: payload.relationLabel,
                category: payload.category,
                phone: payload.phone,
                photoUrl: payload.photoUrl,
                isPinned: payload.isPinned,
                notes: payload.notes,
              }
            : m
        )
      );
      setToastText(`تم تحديث بيانات ${payload.name}`);
    } else {
      const nextOrder =
        members.reduce((max, m) => Math.max(max, m.order), -1) + 1;
      const newMember: FamilyMember = {
        id: `member_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        name: payload.name,
        relationLabel: payload.relationLabel,
        category: payload.category,
        phone: payload.phone,
        photoUrl: payload.photoUrl,
        isPinned: payload.isPinned,
        notes: payload.notes,
        createdAt: Date.now(),
        order: nextOrder,
      };
      setMembers((prev) => [...prev, newMember]);
      setToastText(`تمت إضافة وتثبيت رقم ${payload.name}`);
    }

    setIsFormOpen(false);
    setEditingMember(null);
  };

  const handleDeleteMember = (id: string) => {
    const target = members.find((m) => m.id === id);
    setMembers((prev) => prev.filter((m) => m.id !== id));
    if (target) {
      setToastText(`تم حذف ${target.name} من القائمة`);
    }
  };

  const categoryTabs: Array<RelationCategory | 'all' | 'pinned'> = [
    'all',
    'pinned',
    RelationCategory.Parents,
    RelationCategory.Siblings,
    RelationCategory.SpouseKids,
    RelationCategory.Grandparents,
    RelationCategory.Other,
  ];

  const showPinnedStrip =
    activeCategory === 'all' &&
    searchQuery.trim() === '' &&
    pinnedMembers.length > 0;

  return (
    <div id="top" className="min-h-screen flex flex-col bg-[#F6F7F5] text-slate-900">
      <TopBar
        activeSection={activeCategory === 'pinned' ? 'pinned' : 'all'}
        onSelectSection={(sec) =>
          setActiveCategory(sec === 'pinned' ? 'pinned' : 'all')
        }
        onOpenBackup={() => setIsBackupOpen(true)}
        onOpenAdd={() => {
          setEditingMember(null);
          setIsFormOpen(true);
        }}
      />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Hero / Workspace Intro & Controls */}
        <section className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-6">
            <div className="max-w-2xl">
              <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight text-balance">
                عائلتك في متناول يدك، بضغطة واحدة
              </h1>
              <p className="text-base text-slate-600 mt-2 leading-relaxed">
                ثبّت أرقام وصور أهلك وأحبتك للوصول الفوري إليهم عبر الاتصال
                الهاتفي الاعتيادي أو الواتساب أو الفايبر.
              </p>
            </div>

            {/* Comfort / Grid View Toggle, PWA Install & Mobile Backup Action */}
            <div className="flex flex-wrap items-center justify-between lg:justify-end gap-2 w-full lg:w-auto shrink-0">
              <div
                role="group"
                aria-label="نمط عرض البطاقات"
                className="inline-flex items-center p-1 bg-white border border-[#E4E7E2] rounded-xl"
              >
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  aria-pressed={viewMode === 'grid'}
                  className={`min-h-[38px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                    viewMode === 'grid'
                      ? 'bg-[#0F5C4D] text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>عرض شبكي</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('comfort')}
                  aria-pressed={viewMode === 'comfort'}
                  className={`min-h-[38px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                    viewMode === 'comfort'
                      ? 'bg-[#0F5C4D] text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Maximize2 className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>عرض مريح</span>
                </button>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <PWAInstallButton />

                <button
                  type="button"
                  onClick={() => setIsBackupOpen(true)}
                  aria-label="النسخ الاحتياطي والاستعادة"
                  className="md:hidden min-h-[42px] inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-[#E4E7E2] text-slate-700 text-xs font-semibold whitespace-nowrap shrink-0"
                >
                  <Archive className="w-4 h-4" aria-hidden="true" />
                  <span>نسخة احتياطية</span>
                </button>
              </div>
            </div>
          </div>

          {/* Search & Category Filter Toolbar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="relative w-full md:max-w-sm">
              <label htmlFor="family-search" className="sr-only">
                ابحث بالاسم أو صلة القرابة أو الرقم
              </label>
              <Search
                className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <input
                id="family-search"
                type="text"
                role="searchbox"
                inputMode="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث بالاسم، القرابة، أو الرقم..."
                className="w-full min-h-[46px] pr-10 pl-10 py-2.5 rounded-xl bg-white border border-[#E4E7E2] focus:border-[#0F5C4D] focus:ring-2 focus:ring-[#0F5C4D]/20 outline-none text-sm text-slate-900"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="مسح البحث"
                  className="min-h-[36px] min-w-[36px] flex items-center justify-center absolute left-1.5 top-1/2 -translate-y-1/2 rounded-lg text-slate-400 hover:text-slate-700"
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </button>
              )}
            </div>

            <div
              role="tablist"
              aria-label="تصفية حسب صلة القرابة"
              className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0"
            >
              {categoryTabs.map((cat) => {
                const isActive = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActiveCategory(cat)}
                    className={`min-h-[42px] px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
                      isActive
                        ? 'bg-[#0F5C4D] text-white font-semibold'
                        : 'bg-white border border-[#E4E7E2] text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {CATEGORY_LABELS[cat]}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Pinned Speed-Dial Strip */}
        {showPinnedStrip && (
          <PinnedStrip
            pinnedMembers={pinnedMembers}
            onRecordContact={handleRecordContact}
            onTogglePin={handleTogglePin}
            onMovePinned={handleMovePinned}
          />
        )}

        {/* Main Family Members Grid */}
        <section aria-labelledby="all-family-heading">
          <div className="flex items-baseline justify-between gap-4 mb-4">
            <h2
              id="all-family-heading"
              className="font-display text-xl sm:text-2xl font-bold text-slate-900"
            >
              {activeCategory === 'all'
                ? 'جميع أفراد العائلة'
                : CATEGORY_LABELS[activeCategory]}
            </h2>
            <span className="text-xs font-medium text-slate-500 tabular-nums shrink-0">
              {visibleMembers.length} من {members.length}
            </span>
          </div>

          {members.length === 0 ? (
            <div className="bg-white border border-[#E4E7E2] rounded-3xl p-10 text-center max-w-xl mx-auto my-8">
              <div className="w-14 h-14 rounded-2xl bg-teal-50 text-[#0F5C4D] flex items-center justify-center mx-auto mb-4">
                <Users className="w-7 h-7" aria-hidden="true" />
              </div>
              <h3 className="font-display text-xl font-bold text-slate-900">
                لم تقم بإضافة أي فرد من العائلة بعد
              </h3>
              <p className="text-sm text-slate-600 mt-2 mb-6 leading-relaxed">
                ابدأ بتثبيت رقم وصورة والديك أو إخوتك للاتصال بهم فوراً عبر
                الموبايل أو واتساب أو فايبر.
              </p>
              <button
                type="button"
                onClick={() => {
                  setEditingMember(null);
                  setIsFormOpen(true);
                }}
                className="min-h-[48px] inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0F5C4D] hover:bg-[#0B473B] text-white font-semibold text-sm transition-colors"
              >
                <UserPlus className="w-4 h-4" aria-hidden="true" />
                <span>إضافة أول فرد من العائلة</span>
              </button>
            </div>
          ) : visibleMembers.length === 0 ? (
            <div className="bg-white border border-[#E4E7E2] rounded-3xl p-10 text-center max-w-xl mx-auto my-8">
              <h3 className="font-display text-lg font-bold text-slate-900">
                لا توجد نتائج مطابقة
              </h3>
              <p className="text-sm text-slate-600 mt-1.5 mb-5">
                جرّب البحث باسم آخر أو عرض جميع أفراد العائلة.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('all');
                }}
                className="min-h-[44px] px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-semibold transition-colors"
              >
                عرض جميع أفراد العائلة
              </button>
            </div>
          ) : (
            <div
              data-testid="family-grid"
              className={
                viewMode === 'comfort'
                  ? 'grid grid-cols-1 md:grid-cols-2 gap-6'
                  : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'
              }
            >
              {visibleMembers.map((member) => (
                <ContactCard
                  key={member.id}
                  member={member}
                  viewMode={viewMode}
                  onRecordContact={handleRecordContact}
                  onTogglePin={handleTogglePin}
                  onEdit={(m) => {
                    setEditingMember(m);
                    setIsFormOpen(true);
                  }}
                  onDelete={handleDeleteMember}
                  onOpenQuickMessage={(m) => setQuickMessageMember(m)}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="border-t border-[#E4E7E2] bg-white mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <span>عائلتي — دليل الاتصال السريع بالعائلة</span>
          <span>
            يتم حفظ أرقام وصور عائلتك محلياً على جهازك لخصوصيتك وسرعة الوصول
          </span>
        </div>
      </footer>

      {/* Modals */}
      <MemberFormModal
        isOpen={isFormOpen}
        editingMember={editingMember}
        onClose={() => {
          setIsFormOpen(false);
          setEditingMember(null);
        }}
        onSave={handleSaveMember}
      />

      <QuickMessageModal
        member={quickMessageMember}
        onClose={() => setQuickMessageMember(null)}
        onRecordContact={handleRecordContact}
      />

      <BackupModal
        isOpen={isBackupOpen}
        members={members}
        onClose={() => setIsBackupOpen(false)}
        onImportMembers={(imported) => {
          setMembers(imported);
          setIsBackupOpen(false);
          setToastText(`تم استيراد ${imported.length} فرد بنجاح`);
        }}
        onRestoreDefaults={() => {
          setMembers(SEED_FAMILY_MEMBERS);
        }}
      />

      <OfflineIndicator />

      {/* Non-blocking Toast Confirmation */}
      {toastText && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-slate-900 text-white text-sm font-medium shadow-lg max-w-[90vw] text-center"
        >
          {toastText}
        </div>
      )}
    </div>
  );
}
