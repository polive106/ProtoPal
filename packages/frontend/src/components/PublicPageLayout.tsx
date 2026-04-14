import type { ReactNode } from 'react';
import { LanguageSwitcher } from './LanguageSwitcher';

export function PublicPageLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen">
      <div className="absolute top-4 right-4 z-50">
        <LanguageSwitcher />
      </div>
      {children}
    </div>
  );
}
