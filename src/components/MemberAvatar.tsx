import { useState } from 'react';
import { User } from 'lucide-react';

interface MemberAvatarProps {
  name: string;
  photoUrl?: string;
  sizeClass?: string;
  roundedClass?: string;
  textSizeClass?: string;
}

export function MemberAvatar({
  name,
  photoUrl,
  sizeClass = 'w-16 h-16',
  roundedClass = 'rounded-2xl',
  textSizeClass = 'text-xl',
}: MemberAvatarProps) {
  const [imgError, setImgError] = useState(false);
  const initial = name.trim().charAt(0) || '';
  const showImage = Boolean(photoUrl && !imgError);

  return (
    <div
      className={`${sizeClass} ${roundedClass} relative overflow-hidden shrink-0 bg-gradient-to-br from-teal-700/15 via-slate-100 to-teal-900/15 border border-slate-200/80 flex items-center justify-center`}
    >
      {showImage ? (
        <img
          src={photoUrl}
          alt={`صورة ${name}`}
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className="w-full h-full object-cover object-center"
        />
      ) : (
        <div className="flex flex-col items-center justify-center text-teal-800 select-none">
          {initial ? (
            <span className={`${textSizeClass} font-display font-bold`}>
              {initial}
            </span>
          ) : (
            <User className="w-6 h-6 text-teal-700" aria-hidden="true" />
          )}
        </div>
      )}
    </div>
  );
}
