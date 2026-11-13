import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export function OfflineIndicator() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 right-4 z-40 flex items-center gap-2 rounded-xl bg-amber-700 text-white px-3.5 py-2 text-xs font-semibold shadow-lg"
    >
      <WifiOff className="w-4 h-4 shrink-0" aria-hidden="true" />
      <span>وضع عدم الاتصال — أرقام عائلتك والاتصال الهاتفي متاحان</span>
    </div>
  );
}
