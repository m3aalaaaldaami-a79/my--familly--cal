import { UserPlus } from 'lucide-react';

interface TopBarProps {
  activeSection: 'all' | 'pinned';
  onSelectSection: (section: 'all' | 'pinned') => void;
  onOpenBackup: () => void;
  onOpenAdd: () => void;
}

export function TopBar({
  activeSection,
  onSelectSection,
  onOpenBackup,
  onOpenAdd,
}: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E4E7E2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-line Brand Wordmark */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            onSelectSection('all');
          }}
          className="font-display text-2xl font-extrabold tracking-tight text-[#0F5C4D] whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 rounded-md px-1"
        >
          عائلتي
        </a>

        {/* Zone 2: Clean Single-line Navigation Links */}
        <nav
          aria-label="التنقل الرئيسي"
          className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600"
        >
          <button
            type="button"
            onClick={() => onSelectSection('all')}
            className={`py-2 whitespace-nowrap shrink-0 transition-colors border-b-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 rounded-t-sm ${
              activeSection === 'all'
                ? 'border-[#0F5C4D] text-slate-900 font-semibold'
                : 'border-transparent hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            جميع الأفراد
          </button>
          <button
            type="button"
            onClick={() => onSelectSection('pinned')}
            className={`py-2 whitespace-nowrap shrink-0 transition-colors border-b-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 rounded-t-sm ${
              activeSection === 'pinned'
                ? 'border-[#0F5C4D] text-slate-900 font-semibold'
                : 'border-transparent hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            المثبّتون
          </button>
          <button
            type="button"
            onClick={onOpenBackup}
            className="py-2 whitespace-nowrap shrink-0 transition-colors border-b-2 border-transparent hover:text-slate-900 hover:border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 rounded-t-sm"
          >
            النسخ الاحتياطي
          </button>
        </nav>

        {/* Zone 3: Single Primary Action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onOpenAdd}
            className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0F5C4D] hover:bg-[#0B473B] active:scale-[0.98] text-white text-sm font-semibold transition-all whitespace-nowrap shrink-0 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0F5C4D]"
          >
            <UserPlus className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>إضافة فرد</span>
          </button>
        </div>
      </div>
    </header>
  );
}
